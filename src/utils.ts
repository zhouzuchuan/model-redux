import { ofType, ActionsObservable } from 'redux-observable';
import { AnyAction, Action } from 'redux';

// 封装epic类型 调用
export const epicEnhance = (fn: any) => (action$: ActionsObservable<AnyAction>, ...other: any[]) =>
    fn(action$.pipe(ofType(fn.name)), ...other, action$);

// 创建统计名称
export const createStatisticsName = (str: string): string => `@@_${str}`;

// 添加命名空间
export const addNameSpace = (name: string, model: any) => {
    return Object.entries(model[name] || {}).reduce((r, [n, m]: any) => {
        const funName = `${model.namespace}/${n}`;
        Reflect.defineProperty(m, 'name', { value: funName });
        return { ...r, [funName]: m };
    }, {});
};

// 创建 reducer
export const createReducer = (initialState: any, handlers: any) => (state = initialState, action: Action) => {
    if (handlers.hasOwnProperty(action.type)) {
        return handlers[action.type](state, action);
    } else {
        return state;
    }
};

// 取 effects 名称（没有引入effects则取不到 以及注入了effects 但没有 promise 也取不到）
export const returnEffectName = (type: string, app: any): string => {
    let temp = '';
    if (isString(type)) {
        const effectsName = Object.entries(app.effectsList) as [string, any];
        for (let [v, { promise }] of effectsName) {
            const cache = app[createStatisticsName(v)] || {};
            // 当前action存在 并且存在的effects中有自定义promise则返回
            if (cache[type] && promise) {
                temp = v;
                continue;
            }
        }
    }
    return temp;
};

// 返回数据数据
export const returnArray = (obj: any): any[] => (isArray(obj) ? obj : [obj]);

// 数据类型
export const getType = (obj: any): string =>
    Object.prototype.toString
        .call(obj)
        .slice(8, -1)
        .toLowerCase();
export const isFunction = (o: any): boolean => getType(o) === 'function';
export const isGeneratorFunction = (o: any): boolean => getType(o) === 'generatorfunction';
export const isObject = (o: any): boolean => getType(o) === 'object';
export const isString = (o: any): boolean => getType(o) === 'string';
export const isUndefined = (o: any): boolean => getType(o) === 'undefined';
export const isArray = (o: any): boolean => getType(o) === 'array';
export const isNull = (o: any): boolean => getType(o) === 'null';
export const isBoolean = (o: any): boolean => getType(o) === 'boolean';
export const isNumber = (o: any): boolean => getType(o) === 'number';

export const epicTailProcess = (result: any, namespace: string) => {
    if (Array.isArray(result)) {
        return result.map(v => {
            if (v.type) {
                v.type = prefixType(v.type, namespace);
            }
            return v;
        });
    } else if (isObject(result)) {
        if (result.type) {
            result.type = prefixType(result.type, namespace);
        }
        return result;
    }

    return result;
};

const prefixType = (type: string, namespace: string): string => {
    if (type && !type.includes('/')) {
        type = `${namespace}/${type}`;
    }
    return type;
};
