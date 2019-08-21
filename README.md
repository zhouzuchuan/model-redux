<p align="center">
  <a href="http://ant.design">
    <img width="200" src="./logo.svg">
  </a>
</p>

<h1 align="center">Model Redux</h1>

<div align="center">

[![download](https://img.shields.io/npm/dm/model-redux.svg)](https://www.npmjs.com/search?q=model-redux)
[![npm](https://img.shields.io/npm/v/model-redux.svg)](https://www.npmjs.com/search?q=model-redux)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/zhouzuchuan/model-redux/master/LICENSE)

</div>

## 它是什么

是对 [redux](https://github.com/reduxjs/redux) 的抽象 `model` 封装，通过实现 `model` 层，来管理应用的副作用。

## 下载

```bash

npm install model-redux --save

# or

yarn add model-redux

```

## 特点

-   减少使用 redux 所必须写的样板代码
-   统一管理副作用，实现组件与状态的解耦
-   数据持久化

## 核心

### create<options>

```js
import modelRedux from 'model-redux';

const { store } = modelRedux.create();
```

用来创建 model 方法，需要一个 `options` 参数

`option.middlewares` 需要额外注入的中间件

`option.effects` 需要使用的副作用

内置两套副作用管理 [redux-saga](https://github.com/redux-saga/redux-saga) [redux-observable](https://github.com/redux-observable/redux-observable), 默认采用是 `redux-observable`

如果想同时引用两个，或者 redux-saga，则可以用以下的方式

```js
import modelRedux from 'model-redux';
import epics from 'model-redux/lib/effects/epics';
import sagas from 'model-redux/lib/effects/sagas';

const { store } = modelRedux.create({
    middlewares: [],
    // effects function 支持传入一个参数 即指定model中的字段 默认为当前的 effects name 分别为 epics、 sagas
    effects: [epics(), sagas()],
    // effects:  sagas()
});
```

`create` 返回两个参数

#### store

全局状态

`vue` 以及 `react` 都有相应的使用方法，下面会介绍

#### registerModel

注册 `model` 方法

需要个参数，就是 `model` 的数据，支持数组的方式注入多个

### model 规范

#### namespace

命名空间

#### state

当前 `model` 的数据状态

具体参数可以参考官方 API [redux-persist](https://github.com/rt2zz/redux-persist)

#### reducers

同于 `redux` 里的 `reducer`，接收 `action`，同步更新 `state`
声明更改 `state` 的 `action`（必须为纯函数）

#### 其他参数

这里的其他参数就是收集副作用的参数，如 使用了默认的 [redux-observable](https://github.com/redux-observable/redux-observable) 则，管理副作用的字段就是 `epics`，[redux-saga](https://github.com/redux-saga/redux-saga) 则是 `sagas`，当然这个字段也是可以根据自己使用来定义。通过 `option.effects` 注入，如下：

```js
import modelRedux from 'model-redux';
import sagas from 'model-redux/lib/effects/sagas';

const { store } = modelRedux.create({
    middlewares: [],
    effects: sagas('effects'),
});
```

将管理 `redux-saga` 的字段定为 `effects`

## 使用

统一的 `model` (这里只是展示用法)，`model` 可以在初始化中注册，也可以实现按需加载注册

```js
// app.js

import { mapTo } from 'rxjs/operators';

export default {
    namespace: 'app',
    state: {},
    epics: {
        add: epic$ => return epic$.pipe(
                mapTo({
                    type: 'app/success',
                    payload: 'ddd'
                })
            )
    },
    reducers: {
        success(store) {
            return store;
        }
    }
};
```

> 调用当前 `model` 中 reducers 时，action type 可以省略命名空间， 如果是跨 model 则必须添加命名空间

```js

    epics: {
        add: epic$ => return epic$.pipe(
                switchMap(() => [
                    // dispatch 当前 model 的 success reducers
                    {
                        type: 'success',
                        payload: 'ddd'
                    },
                    // dispatch edit model的 success reducers
                    {
                    type: 'edit/success',
                    payload: 'ddd'
                },
                ])
            )
    },

```

### React

对于 `react` 的使用，可以使用 已经内置了 model-redux 的无侵入架构增强器 [react-enhanced](https://github.com/zhouzuchuan/react-enhanced)，

```js
// index.js

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import modelRedux from 'model-redux';
import App from './App';

import appModel from './app.js';

const { store, registerModel } = modelRedux.create();

registerModel(appModel);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'),
);
registerServiceWorker();
```

```js
// 子组件

import React from 'react';
import { connect } from 'react-redux';

class ChlidrenComponent extends React.Component {
    // ...
    render() {
        return <span onClick={this.props.handleAdd}>model-redux</span>;
    }
}

export default connect(
    null,
    dispatch => {
        return {
            handleAdd() {
                dispatch({
                    type: 'app/add',
                });
            },
        };
    },
)(ChlidrenComponent);
```

> 其他可以使用 `redux` 的架构的框架 都可以使用 `model-redux`  
> 比如 `小程序多端框架` [taro](https://github.com/NervJS/taro)

## License

[MIT](https://tldrlegal.com/license/mit-license)

## 致敬

[dva](https://github.com/dvajs/dva)

## 开发计划
