import { persistStore } from 'redux-persist';
import configureStore from './configureStore';
import registerModel from './registerModel';
import { MODELS, STORE } from './config';
import { isFunction, isArray } from './utils';

export interface Icteate {
    middlewares?: never[];
    effects?: null | any;
    persist?: {
        storage: any;
    };
}

export const create = ({ middlewares = [], effects = null, persist } = {} as Icteate) => {
    const app = {
        [MODELS]: [],
        effectsList:
            effects === null
                ? // 取默认
                  require('./effects/epics').default()
                : (isArray(effects) ? effects : [effects]).reduce((r: any, fn: () => any) => {
                      return {
                          ...r,
                          ...(isFunction(fn) ? fn() : fn),
                      };
                  }, {}),
        [STORE]: null,
    };

    const store = configureStore(app, middlewares);

    return {
        store,
        persistor: persistStore(store),
        registerModel: registerModel.bind(null, app, persist),
    };
};

export default {
    create,
};
