import { Subject, queueScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { ActionsObservable, StateObservable } from 'redux-observable';

import { isFunction, epicEnhance } from '../utils';

// import { console } from '../utils'

const actionSubject$ = new Subject().pipe(observeOn(queueScheduler));
const stateSubject$ = new Subject().pipe(observeOn(queueScheduler));
const action$ = new ActionsObservable(actionSubject$);

export default (app, store) => {
  const { dispatch, getState } = store;
  const state$ = new StateObservable(stateSubject$, getState());
  return next => action => {
    if (isFunction(action)) {
      action(dispatch, getState);
      return;
    }
    const { __RESOLVE__, __REJECT__, typeName, ...rest } = action;

    if (typeName !== 'epics') {
      next(action);
      return;
    }

    if (isFunction(__RESOLVE__) && isFunction(__REJECT__)) {
      const fns = app._epics[rest.type];

      if (isFunction(fns)) {
        try {
          __RESOLVE__(epicEnhance(fns)(action$, state$));
        } catch (e) {
          __REJECT__(e);
        }
      } else {
        console.warn(`${rest.type} must be function!`);
        __REJECT__(new Error());
      }
    } else {
      next(rest);
    }
  };
};
