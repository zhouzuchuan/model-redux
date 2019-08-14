import createSagaMiddleware from 'redux-saga';
import { fork, takeLatest, all, put, select, call } from 'redux-saga/effects';
import invariant from 'invariant';
import { AnyAction } from 'redux';

import { isGeneratorFunction, isFunction, createStatisticsName, epicTailProcess } from '../utils';

export const middleware = createSagaMiddleware();

// 封装put
const putEffect = (namespace: string) => (action: AnyAction) => put(epicTailProcess(action, namespace));

export const injectAsync = (injectAsyncSagas: any) => {
    Object.entries(injectAsyncSagas).forEach(([name, fns]: any) => {
        middleware.run(function*() {
            yield all([
                ...Object.entries(fns).map(([n, m]: any) => {
                    return takeLatest(n, function*(action) {
                        yield all([
                            fork(
                                m.bind(null, action, {
                                    put: putEffect(name),
                                    select,
                                    call,
                                }),
                            ),
                        ]);
                    });
                }),
            ]);
        });
    });
};

export const promise = (name: string, app: any, store: any) => (next: any) => (action: any) => {
    const { dispatch, getState } = store;

    if (isFunction(action)) {
        action(dispatch, getState);
        return;
    }

    const { __RESOLVE__, __REJECT__, typeName, ...rest } = action;

    // 如果当前action并非从sagas中分发 则跳过
    if (typeName !== name) {
        next(action);
        return;
    }

    if (isFunction(__REJECT__) && isFunction(__RESOLVE__)) {
        const fns = app[createStatisticsName(name)][rest.type];

        if (isGeneratorFunction(fns)) {
            const gen = actionG(fns, rest, __RESOLVE__, __REJECT__);
            const next2 = () => {
                if (!gen.next().done) next2();
            };
            next2();
        } else {
            invariant(false, `${rest.type} must be function!`);
            __REJECT__(new Error());
        }
    } else {
        next(rest);
    }
};

function* actionG(fns: any, rest: any, resolve: any, reject: any) {
    try {
        const ret = yield fns(rest, { put, call, select });
        resolve(ret);
    } catch (e) {
        reject(e);
    }
}

export default function(name = 'sagas') {
    return {
        [name]: {
            middleware,
            injectAsync,
            promise: promise.bind(null, name),
        },
    };
}
