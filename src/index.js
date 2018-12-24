import configureStore from './configureStore.js'
import registerModel from './registerModel.js'
import { MODELS, STORE } from './config'
import { isFunction, isArray } from './utils'

export const create = ({ middlewares = [], effects = null } = {}) => {
    const app = {
        [MODELS]: [],
        effectsList:
            effects === null
                ? // 取默认
                  require('./effects/epics').default()
                : (isArray(effects) ? effects : [effects]).reduce((r, fn) => {
                      return {
                          ...r,
                          ...(isFunction(fn) ? fn() : fn)
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
