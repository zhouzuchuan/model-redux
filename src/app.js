import createSagaMiddleware from 'redux-saga';
import { createEpicMiddleware, combineEpics } from 'redux-observable';

import { BehaviorSubject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { fork, takeLatest, all, put, select, call } from 'redux-saga/effects';

import { epicEnhance } from './utils';

export default {
  app: null,
  effectsList: {
    sagas: {
      middleware: createSagaMiddleware(),
      injectAsync(injectAsyncSagas, middleware) {
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
              middleware.run(m);
            }
          }
        }
      }
    },
    epics: {
      middleware: createEpicMiddleware(),
      injectAsync(injectAsyncEpics, middleware) {
        if (injectAsyncEpics) {
          const epic$ = new BehaviorSubject(
            combineEpics(
              ...Object.values(injectAsyncEpics).reduce(
                (r, m) => [...r, ...Object.values(m).map(v => epicEnhance(v))],
                []
              )
            )
          );

          const rootEpic = (action$, state$) => epic$.pipe(mergeMap(epic => epic(action$, state$)));

          middleware.run(rootEpic);
        }
      }
    }
  }
};
