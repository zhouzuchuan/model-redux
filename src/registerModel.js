import { combineReducers } from 'redux'
import omit from 'lodash.omit'

import { addNameSpace, createStatisticsName, createReducer, isObject, isUndefined } from './utils'
import { keyword, STORE, MODELS, REDUCERS } from './config'

export default function registerModel(app = null, models) {
    if (app === null) {
        console.warn('model-redux 并未创建！')
        return
    }

    const col = (Array.isArray(models) ? models : [models])
        .filter(model => {
            if (!isObject(model)) {
                console.warn('model 必须导出object，请检查！')
                return false
            }
            const { namespace } = model
            if (isUndefined(namespace)) {
                console.warn('namespace 必填并且唯一，请检查！')
                return false
            }

            app[MODELS].push(namespace)
            return true
        })
        .reduce(
            (r, model) => {
                const dealKey = Object.keys(omit(model, keyword))

                const { namespace, state = {} } = model

                // 对需要添加命名空间的key统一处理
                return ['reducers', ...dealKey].reduce(
                    (r1, effectsname, i) => {
                        const injectAsyncData = addNameSpace(effectsname, model)

                        const tag = createStatisticsName(effectsname)

                        // 第一个（reducers）不加入统计
                        if (i) {
                            app[tag] = {
                                ...(app[tag] || {}),
                                ...injectAsyncData
                            }
                        } else {
                            if (!app[tag]) app[tag] = {}
                        }

                        return {
                            ...r1,
                            [effectsname]: {
                                ...(r[effectsname] || {}),
                                [namespace]: injectAsyncData
                            }
                        }
                    },
                    {
                        ...r,
                        state: {
                            ...r.state,
                            [namespace]: state
                        }
                    }
                )
            },
            { state: {} }
        )

    // 注入reducer
    for (let [n, m] of Object.entries(col.reducers)) {
        app[REDUCERS][n] = createReducer(col.state[n] || {}, m)
    }
    app[STORE].replaceReducer(combineReducers(app[REDUCERS]))

    // 载入声明的effects
    Object.entries(app.effectsList).forEach(([effectsname, { injectAsync, middleware }]) => {
        if (col[effectsname]) {
            injectAsync(col[effectsname], middleware)
        }
    })
}
