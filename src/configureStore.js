import { createStore, applyMiddleware, compose } from 'redux';

import distributeMiddleware from './middleware/distributeMiddleware.js';
import observableMiddlevare from './middleware/observableMiddlevare.js';
import promiseMiddleware from './middleware/promiseMiddleware.js';

export default function(app, middlewares = []) {
  console.log(app);
  const devtools =
    typeof window === 'object' && process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__
      : () => f => f;

  // 中间件列表
  const middleware2 = [
    ...Object.values(app.effectsList).map(v => v.middleware),
    distributeMiddleware.bind(null, app),
    observableMiddlevare.bind(null, app),
    promiseMiddleware.bind(null, app),
    ...middlewares
  ];

  const store = createStore(f => f, {}, compose(...[applyMiddleware(...middleware2), devtools()]));

  app._store = store;

  return store;
}
