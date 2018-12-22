import pick from 'lodash.pick'
import configureStore from './configureStore.js'
import registerModel from './registerModel.js'
import { MODELS, STORE } from './config'
import { isFunction, isArray } from './utils'

const mustKey = ['middleware', 'injectAsync', 'promise']

export const create = ({ middlewares = [], effects = null } = {}) => {
    const app = {
        [MODELS]: [],
        effectsList:
            effects === null
                ? // 取默认
                  require('./effects/epics').default()
                : (isArray(effects) ? effects : [effects]).reduce((r, fn) => {
                      const obj = isFunction(fn) ? fn() : fn
                      return {
                          ...r,
                          ...(Object.keys(pick(obj, mustKey)).length === mustKey.length && obj)
                      }
                  }, {}),
        [STORE]: null
    }

    const store = configureStore(app, middlewares)

    return {
        store,
        registerModel: registerModel.bind(null, app)
    }
}

export default {
    create
}
