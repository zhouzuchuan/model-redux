import { createStatisticsName } from './utils';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

// 模型关键词
export const keyword = ['state', 'namespace', 'reducers', 'persist'];

export const STORE = createStatisticsName('store');
export const MODELS = createStatisticsName('models');
export const REDUCERS = createStatisticsName('reducers');

// 持久化默认配置
export const modelPersistConfig = {
    storage: storage,
    blacklist: [],
    whitelist: [],
    stateReconciler: autoMergeLevel2,
    transform: [],
};
