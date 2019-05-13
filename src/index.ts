import configureStore from './configureStore';
import registerModel from './registerModel';
import { MODELS, STORE } from './config';
import { isFunction, isArray, isObject } from './utils';
import { REDUCERS } from './config';

export interface ModelConfig {
    middlewares?: never[];
    effects?: null | any;
    persist?: any;
    initialReducers: any;
}

export const create = ({ middlewares = [], effects = null, persist, initialReducers = {} } = {} as ModelConfig) => {
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
        [REDUCERS]: initialReducers,
    };

    const store = configureStore(app, middlewares);

    const persistStore = persist ? require('redux-persist').persistStore : () => null;

    const persistConfig = persist ? (isObject(persist) ? persist : {}) : false;

    return {
        store,
        persistor: persistStore(store),
        registerModel: registerModel.bind(null, app, { persistConfig }),
    };
};

export default {
    create,
};
