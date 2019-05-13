import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { STORE } from './config';
import { returnArray } from './utils';

import distributeMiddleware from './distributeMiddleware';

export default function(app: any, middlewaresList = []) {
    const devtools =
        typeof window === 'object' &&
        process.env.NODE_ENV !== 'production' &&
        (window as any).__REDUX_DEVTOOLS_EXTENSION__
            ? (window as any).__REDUX_DEVTOOLS_EXTENSION__
            : () => (f: any) => f;

    // 分发effects middleware
    const [middlewares = [], promises = []]: any = Object.values(app.effectsList).reduce(
        (r: any[], { middleware, promise }: any): any[] => [
            [...r[0], middleware],
            [...r[1], ...(promise ? [promise.bind(null, app)] : [])],
        ],
        [[], []],
    );

    const [beforeMW = [], afterMW = []] = middlewaresList;

    // 中间件列表
    const middleware2 = [
        ...middlewares,
        ...returnArray(beforeMW),
        distributeMiddleware.bind(null, app),
        ...promises,
        ...returnArray(afterMW),
    ];

    const store = createStore((f: any) => f, {}, compose(...[applyMiddleware(...middleware2), devtools()]));
    // const store = createStore((f: any) => f, {}, compose(...[applyMiddleware(...middleware2), devtools()]));

    app[STORE] = store;

    return store;
}
