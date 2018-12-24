import { ofType } from 'redux-observable'

// 封装epic类型 调用
export const epicEnhance = fn => (action$, ...other) => fn(action$.pipe(ofType(fn.name)), ...other, action$)

// 创建统计名称
export const createStatisticsName = str => `@_${str}`

// 添加命名空间
export const addNameSpace = (name, model) => {
    return Object.entries(model[name] || {}).reduce((r, [n, m]) => {
        const funName = `${model.namespace}/${n}`
        Reflect.defineProperty(m, 'name', { value: funName })
        return { ...r, [funName]: m }
    }, {})
}

// 创建 reducer
export const createReducer = (initialState, handlers) => (state = initialState, action) => {
    if (handlers.hasOwnProperty(action.type)) {
        return handlers[action.type](state, action)
    } else {
        return state
    }
}

// 取 effects 名称
export const returnEffectName = (type, app) => {
    let temp = ''
    if (isString(type)) {
        const effectsName = Object.keys(app.effectsList)
        for (let v of effectsName) {
            const cache = app[createStatisticsName(v)] || {}
            if (cache[type]) {
                temp = v
                continue
            }
        }
    }
    return temp
}

// 返回数据数据
export const returnArray = obj => (isArray(obj) ? obj : [obj])

// 数据类型
export const getType = obj =>
    Object.prototype.toString
        .call(obj)
        .slice(8, -1)
        .toLowerCase()
export const isFunction = o => getType(o) === 'function'
export const isGeneratorFunction = o => getType(o) === 'generatorfunction'
export const isObject = o => getType(o) === 'object'
export const isString = o => getType(o) === 'string'
export const isUndefined = o => getType(o) === 'undefined'
export const isArray = o => getType(o) === 'array'
export const isNull = o => getType(o) === 'null'
export const isBoolean = o => getType(o) === 'boolean'
export const isNumber = o => getType(o) === 'number'
