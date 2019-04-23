import { combineReducers } from 'redux';

import { addNameSpace, createStatisticsName, createReducer, isObject, isUndefined } from './utils';
import { keyword, STORE, MODELS, REDUCERS } from './config';

import * as invariant from 'invariant';

type config = {
    persistConfig: any | boolean;
};

export default function registerModel(app: any = null, { persistConfig }: config, models: any) {
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

    const persistReducer = persistConfig ? require('redux-persist').persistReducer : () => null;

    // 持久化默认配置
    const modelPersistConfig = persistConfig
        ? {
              storage: require('redux-persist/lib/storage/session').default,
              stateReconciler: require('redux-persist/lib/stateReconciler/autoMergeLevel2').default,
              ...(isObject(persistConfig) ? persistConfig : {}),
          }
        : {};

    // 注入reducer
    for (let [n, m] of Object.entries(col.reducers)) {
        const reducer = createReducer(col.state[n] || {}, m);

        // 当前模型是否声明了持久化
        const hasPersistCurrent = col.persist[n];

        // 如果有持久化 则添加配置
        app[REDUCERS][n] =
            hasPersistCurrent && persistConfig
                ? persistReducer({ ...modelPersistConfig, ...hasPersistCurrent, key: n }, reducer)
                : reducer;
    }

    const combine = combineReducers(app[REDUCERS]);

    app[STORE].replaceReducer(
        persistConfig ? persistReducer({ ...modelPersistConfig, key: 'root' }, combine) : combine,
    );

    // 载入声明的effects
    Object.entries(app.effectsList).forEach(([effectsname, { injectAsync, middleware }]: [string, any]) => {
        if (col[effectsname]) {
            injectAsync(col[effectsname], middleware);
        }
    });
}
