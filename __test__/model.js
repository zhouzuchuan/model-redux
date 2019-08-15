import { switchMap } from 'rxjs/operators';
import { defaultText, authorName } from './constant';

export default {
    namespace: 'app',
    state: {
        text: defaultText,
    },
    epics: {
        // 异步处理 (转发省略命名空间)
        forwardAction: epic$ =>
            epic$.pipe(
                switchMap(action => {
                    return [
                        {
                            type: 'setText',
                            payload: authorName,
                        },
                    ];
                }),
            ),
    },
    reducers: {
        setText(state, action) {
            return {
                text: action.payload,
            };
        },
    },
};
