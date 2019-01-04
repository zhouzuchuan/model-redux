import { returnEffectName } from './utils';

export default (app: any) => (next: any) => (action: any) => {
    const name = returnEffectName(action.type, app);

    // 如果有 则分发
    if (name) {
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
