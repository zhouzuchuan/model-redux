import { isString } from '../utils';

export default app => next => action => {
  const name = returnEffectName(action.type, app);

  if (!!name) {
    return new Promise((resolve, reject) =>
      next({
        typeName: name,
        __RESOLVE__: resolve,
        __REJECT__: reject,
        ...action
      })
    );
  } else {
    next(action);
  }
};

// 截取 effects 名称
function returnEffectName(type, app) {
  let temp = '';

  if (isString(type)) {
    const effectsName = Object.keys(app.effectsList);
    for (let v of effectsName) {
      const cache = app[`_${v}`] || {};
      if (cache[type]) {
        temp = v;
        continue;
      }
    }
  }

  return temp;
}
