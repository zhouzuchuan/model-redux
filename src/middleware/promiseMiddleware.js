import { put, call, select } from 'redux-saga/effects';
import { isGeneratorFunction, isFunction } from '../utils';

export default (app, store) => next => action => {
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
    const fns = app._sagas[rest.type];

    if (isGeneratorFunction(fns)) {
      function* actionG() {
        try {
          const ret = yield fns(rest, { put, call, select });

          __RESOLVE__(ret);
        } catch (e) {
          __REJECT__(e);
        }
      }

      const gen = actionG();
      const next2 = () => {
        if (!gen.next().done) next2();
      };
      next2();
    } else {
      console.warn(`${rest.type} must be function!`);
      __REJECT__(new Error());
    }
  } else {
    next(rest);
  }
};
