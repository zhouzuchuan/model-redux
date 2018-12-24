import { createStore, applyMiddleware, compose } from 'redux'
import zip from 'lodash.zip'
import { STORE } from './config'

import distributeMiddleware from './distributeMiddleware.js'

export default function(app, middlewaresList = []) {
    const devtools =
        typeof window === 'object' && process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__
            ? window.__REDUX_DEVTOOLS_EXTENSION__
            : () => f => f

    const [middlewares = [], promises = []] = zip(
        ...Object.values(app.effectsList).map(v => [v.middleware, v.promise.bind(null, app)])
    )

    // 中间件列表
    const middleware2 = [...middlewares, distributeMiddleware.bind(null, app), ...promises, ...middlewaresList]

    const store = createStore(f => f, {}, compose(...[applyMiddleware(...middleware2), devtools()]))

    app[STORE] = store

    console.log(app)

    return store
}
