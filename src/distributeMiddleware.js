import { returnEffectName } from './utils'

export default app => next => action => {
    const name = returnEffectName(action.type, app)

    if (name) {
        return new Promise((resolve, reject) =>
            next({
                typeName: name,
                __RESOLVE__: resolve,
                __REJECT__: reject,
                ...action
            })
        )
    } else {
        next(action)
    }
}
