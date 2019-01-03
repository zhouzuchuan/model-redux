import { createStore, applyMiddleware, compose } from 'redux'
import zip from 'lodash.zip'
import { STORE } from './config'
import { returnArray } from './utils'

import distributeMiddleware from './distributeMiddleware.js'

export default function(app, middlewaresList = []) {
    const devtools =
        typeof window === 'object' && process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__
            ? window.__REDUX_DEVTOOLS_EXTENSION__
            : () => f => f

    // 分发effects middleware
    const [middlewares = [], promises = []] = zip(
        ...Object.values(app.effectsList).map(({ middleware, promise }) => [
            middleware,
            ...(promise ? [promise.bind(null, app)] : [])
        ])
    )

    const [beforeMW = [], afterMW = []] = middlewaresList

    // 中间件列表
    const middleware2 = [
        ...middlewares,
        ...returnArray(beforeMW),
        distributeMiddleware.bind(null, app),
        ...promises,
        ...returnArray(afterMW)
    ]

    const store = createStore(f => f, {}, compose(...[applyMiddleware(...middleware2), devtools()]))

    app[STORE] = store

    return store
}
