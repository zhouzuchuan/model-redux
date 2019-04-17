import { combineReducers } from 'redux';

import { addNameSpace, createStatisticsName, createReducer, isObject, isUndefined } from './utils';
import { keyword, STORE, MODELS, REDUCERS } from './config';
// import { persistReducer } from 'redux-persist';

import * as invariant from 'invariant';

export default function registerModel(app: any = null, persist: any = {}, models: any) {
    if (app === null) {
        invariant(false, 'model-redux 并未创建！');
        return;
    }

    let temp = false;

    const col = (Array.isArray(models) ? models : [models])
        .filter(model => {
            if (!isObject(model)) {
                return false;
            }
            const { namespace } = model;
            if (isUndefined(namespace)) {
                invariant(false, 'namespace 必填并且唯一，请检查！');
                return false;
            }

            // 过滤重复载入
            if (app[MODELS].includes(namespace)) {
                return false;
            }

            app[MODELS].push(namespace);
            return true;
        })
        .reduce((r, model) => {
            const dealKey: string[] = Object.keys(model).filter((v: string) => !keyword.includes(v));

            const { namespace, state = {}, persist } = model;

            temp = true;

            // 对需要添加命名空间的key统一处理
            return ['reducers', ...dealKey].reduce(
                (r1, effectsname, i) => {
                    const injectAsyncData = addNameSpace(effectsname, model);

                    const tag = createStatisticsName(effectsname);

                    // 第一个（reducers）不加入统计
                    if (i) {
                        app[tag] = {
                            ...(app[tag] || {}),
                            ...injectAsyncData,
                        };
                    } else {
                        if (!app[tag]) app[tag] = {};
                    }

                    return {
                        ...r1,
                        [effectsname]: {
                            ...(r[effectsname] || {}),
                            [namespace]: injectAsyncData,
                        },
                    };
                },
                {
                    ...r,
                    state: {
                        ...(r.state || {}),
                        [namespace]: state,
                    },
                    persist: {
                        ...(r.state || {}),
                        ...(persist && { [namespace]: state }),
                    },
                },
            );
        }, {});

    // 没有载入新的模型 取消
    if (!temp) return;

    // 注入reducer
    for (let [n, m] of Object.entries(col.reducers)) {
        app[REDUCERS][n] = createReducer(col.state[n] || {}, m);
    }
    app[STORE].replaceReducer(combineReducers(app[REDUCERS]));

    // 所有模型中是否有一个或多个模型声明了持久化
    const hasPersist = !!Object.entries(col.persist).length;

    const persistReducer = hasPersist ? require('redux-persist').persistReducer : () => null;

    // 持久化默认配置
    const modelPersistConfig = hasPersist
        ? {
              storage: Reflect.get(persist, 'storage') || require('redux-persist/lib/storage/session').default,
              stateReconciler: require('redux-persist/lib/stateReconciler/autoMergeLevel2').default,
          }
        : {};

    // 注入reducer
    for (let [n, m] of Object.entries(col.reducers)) {
        const reducer = createReducer(col.state[n] || {}, m);

        // 当前模型是否声明了持久化
        const hasPersistCurrent = col.persist[n];

        // 如果有持久化 则添加配置
        app[REDUCERS][n] = hasPersistCurrent ? persistReducer({ ...modelPersistConfig, key: n }, reducer) : reducer;
    }

    const combine = combineReducers(app[REDUCERS]);
    app[STORE].replaceReducer(hasPersist ? persistReducer({ ...modelPersistConfig, key: 'root' }, combine) : combine);

    // 载入声明的effects
    Object.entries(app.effectsList).forEach(([effectsname, { injectAsync, middleware }]: [string, any]) => {
        if (col[effectsname]) {
            injectAsync(col[effectsname], middleware);
        }
    });
}
