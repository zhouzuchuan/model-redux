import React from 'react';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import App from './App';
import { defaultText, packageName, authorName } from './constant';

import { create } from '../lib';
import model from './model';

const { store, registerModel } = create();

configure({ adapter: new Adapter() });

function setup() {
    const enzymeWrapper = mount(
        <Provider store={store}>
            <App />
        </Provider>,
    );
    return {
        enzymeWrapper,
    };
}

describe('model -------->', () => {
    let wrapper;

    registerModel(model);

    beforeEach(() => {
        const { enzymeWrapper, props } = setup();
        wrapper = enzymeWrapper;
    });

    it('使用 store，组件渲染成功！', () => {
        expect(wrapper.find('header.header').text()).toEqual(defaultText);
    });
    it('测试点击，state 是否更改', () => {
        wrapper.find('button.change').simulate('click');
        expect(wrapper.find('header.header').text()).toEqual(packageName);
    });

    it('同一model中， action type 省略 namespace', () => {
        wrapper.find('button.forwardAction').simulate('click');
        expect(wrapper.find('header.header').text()).toEqual(authorName);
    });
});
