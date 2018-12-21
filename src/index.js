import configureStore from './configureStore.js';
import registerModel from './registerModel.js';
import global from './app';

export const create = ({ middlewares = [] } = {}) => {
  const app = {
    _models: [],
    _reducers: {},
    effectsList: global.effectsList,
    _store: null
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
