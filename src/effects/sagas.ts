import createSagaMiddleware from 'redux-saga';
import { fork, takeLatest, all, put, select, call } from 'redux-saga/effects';

import { isGeneratorFunction, isFunction, createStatisticsName } from '../utils';

import * as invariant from 'invariant';

export const middleware = createSagaMiddleware();

export const injectAsync = (injectAsyncSagas: any) => {
    const temp = Object.entries(injectAsyncSagas).reduce((r, [name, fns]) => {
        return {
            ...r,
            [name]: function*() {
                yield all([
                    fork(function*() {
                        yield all([
                            ...Object.entries(fns).map(([n, m]) => {
                                return takeLatest(n, function*(action) {
                                    yield all([
                                        fork(
                                            m.bind(null, action, {
                                                put,
                                                select,
                                                call
                                            })
                                        )
                                    ]);
                                });
                            })
                        ]);
                    })
                ]);
            }
        };
    }, {});

    if (temp) {
        for (let [n, m] of Object.entries(temp)) {
            if (Object.prototype.hasOwnProperty.call(temp, n)) {
                middleware.run(m as any);
            }
        }
    }
};

export const promise = (name: string, app: any, store: any) => (next: any) => (action: any) => {
    const { dispatch, getState } = store;

    if (isFunction(action)) {
        action(dispatch, getState);
        return;
    }

    const { __RESOLVE__, __REJECT__, typeName, ...rest } = action;

    if (typeName !== 'sagas') {
        next(action);
        return;
    }

    if (isFunction(__REJECT__) && isFunction(__RESOLVE__)) {
        const fns = app[name][rest.type];

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
            promise: promise.bind(null, createStatisticsName(name))
        }
    };
}