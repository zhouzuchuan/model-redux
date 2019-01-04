import configureStore from './configureStore';
import registerModel from './registerModel';
import { MODELS, STORE } from './config';
import { isFunction, isArray } from './utils';

export interface Icteate {
    middlewares?: never[];
    effects?: null | any;
}

export const create = ({ middlewares = [], effects = null } = {} as Icteate) => {
    const app = {
        [MODELS]: [],
        effectsList:
            effects === null
                ? // 取默认
                  require('./effects/epics').default()
                : (isArray(effects) ? effects : [effects]).reduce((r: any, fn: () => any) => {
                      return {
                          ...r,
                          ...(isFunction(fn) ? fn() : fn)
                      };
                  }, {}),
        [STORE]: null
    };

    const store = configureStore(app, middlewares);

    return {
        store,
        registerModel: registerModel.bind(null, app)
    };
};

export default {
    create
};
