import { Subject, queueScheduler, BehaviorSubject } from 'rxjs';
import { observeOn, mergeMap, map } from 'rxjs/operators';
import { createEpicMiddleware, combineEpics, ActionsObservable, StateObservable } from 'redux-observable';
import { AnyAction } from 'redux';

import invariant from 'invariant';

import {
    isFunction,
    epicEnhance,
    epicTailProcess,
    // createStatisticsName
} from '../utils';

export const middleware = createEpicMiddleware();

export const injectAsync = (injectAsyncEpics: any) => {
    if (injectAsyncEpics) {
        Object.entries(injectAsyncEpics).forEach(([n, m]: any) => {
            const epic$ = new BehaviorSubject(combineEpics(...Object.values(m).map((v: any) => epicEnhance(v))));

            const rootEpic: any = (action$: ActionsObservable<AnyAction>, state$: StateObservable<any>) =>
                epic$.pipe(
                    mergeMap((epic: any) => epic(action$, state$)),
                    map(result => epicTailProcess(result, n)),
                );

            middleware.run(rootEpic);
        });

        // const epics: any = Object.values(injectAsyncEpics).reduce(
        //     (r: any[], m: any) => [...r, ...Object.values(m).map((v: any) => epicEnhance(v))],
        //     [],
        // );
        // const epic$ = new BehaviorSubject(combineEpics(...epics));

        // const rootEpic: any = (action$: ActionsObservable<AnyAction>, state$: StateObservable<any>) =>
        //     epic$.pipe(mergeMap((epic: any) => epic(action$, state$)));

        // middleware.run(rootEpic);
    }
};

const actionSubject$: any = new Subject().pipe(observeOn(queueScheduler));
const stateSubject$: any = new Subject().pipe(observeOn(queueScheduler));
const action$ = new ActionsObservable(actionSubject$);

// 暂未使用
export const promise = (name: string, app: any, store: any) => {
    const { dispatch, getState } = store;
    const state$ = new StateObservable(stateSubject$, getState());
    return (next: any) => (action: any) => {
        if (isFunction(action)) {
            action(dispatch, getState);
            return;
        }
        const { __RESOLVE__, __REJECT__, typeName, ...rest } = action;

        if (typeName !== 'epics') {
            next(action);
            return;
        }

        const fns = app[name][rest.type];

        if (isFunction(__RESOLVE__) && isFunction(__REJECT__)) {
            if (isFunction(fns)) {
                try {
                    __RESOLVE__(epicEnhance(fns)(action$, state$));
                } catch (e) {
                    __REJECT__(e);
                }
            } else {
                invariant(false, `${rest.type} must be function!`);
                __REJECT__(new Error());
            }
        } else {
            next(rest);
        }
    };
};

export default function(name = 'epics') {
    return {
        [name]: {
            middleware,
            injectAsync,
            // promise: promise.bind(null, createStatisticsName(name))
        },
    };
}
