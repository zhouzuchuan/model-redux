import { Subject, queueScheduler, BehaviorSubject } from 'rxjs'
import { observeOn, mergeMap } from 'rxjs/operators'
import { createEpicMiddleware, combineEpics, ActionsObservable, StateObservable, console } from 'redux-observable'

import {
    isFunction,
    epicEnhance
    // createStatisticsName
} from '../utils'

export const middleware = createEpicMiddleware()

export const injectAsync = injectAsyncEpics => {
    if (injectAsyncEpics) {
        const epic$ = new BehaviorSubject(
            combineEpics(
                ...Object.values(injectAsyncEpics).reduce(
                    (r, m) => [...r, ...Object.values(m).map(v => epicEnhance(v))],
                    []
                )
            )
        )

        const rootEpic = (action$, state$) => epic$.pipe(mergeMap(epic => epic(action$, state$)))

        middleware.run(rootEpic)
    }
}

const actionSubject$ = new Subject().pipe(observeOn(queueScheduler))
const stateSubject$ = new Subject().pipe(observeOn(queueScheduler))
const action$ = new ActionsObservable(actionSubject$)

// 暂未使用
export const promise = (name, app, store) => {
    const { dispatch, getState } = store
    const state$ = new StateObservable(stateSubject$, getState())
    return next => action => {
        if (isFunction(action)) {
            action(dispatch, getState)
            return
        }
        const { __RESOLVE__, __REJECT__, typeName, ...rest } = action

        if (typeName !== 'epics') {
            next(action)
            return
        }

        const fns = app[name][rest.type]

        if (isFunction(__RESOLVE__) && isFunction(__REJECT__)) {
            if (isFunction(fns)) {
                try {
                    __RESOLVE__(epicEnhance(fns)(action$, state$))
                } catch (e) {
                    __REJECT__(e)
                }
            } else {
                console.warn(`${rest.type} must be function!`)
                __REJECT__(new Error())
            }
        } else {
            next(rest)
        }
    }
}

export default function(name = 'epics') {
    return {
        [name]: {
            middleware,
            injectAsync
            // promise: promise.bind(null, createStatisticsName(name))
        }
    }
}
