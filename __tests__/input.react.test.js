import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';

import Button from '../src/index';
import Input from '../src/Input.jsx';

const { describe, it, expect } = global;

describe('Typeahead Input', () => {
  it('should return true for isCursorAtEnd', () => {
    const _onChange = () => {};
    const wrapper = mount(
        <Input value="test" onChange={_onChange}/>
    );
    let instance = wrapper.instance();
    instance._input.selectionStart = instance._input.selectionEnd = 4;
    instance._input.focus();
    expect(wrapper.instance().isCursorAtEnd()).toBeTruthy();

    instance._input.selectionStart = instance._input.selectionEnd = 0;
    wrapper.setProps({value:""});
    expect(wrapper.instance().isCursorAtEnd()).toBeTruthy();
  });

  it('should return false for isCursorAtEnd', () => {
    const _onChange = () => {};
    const wrapper = mount(
        <Input value="test" onChange={_onChange}/>
    );
    let instance = wrapper.instance();
    instance._input.selectionStart = 2;
    instance._input.selectionEnd = 4;
    instance._input.focus();
    expect(wrapper.instance().isCursorAtEnd()).toBeFalsy();
  });

  it('should trigger blur on input', () => {
    const _onChange = () => {};
    const onBlur = sinon.spy();
    const wrapper = mount(
        <Input value="test" onChange={_onChange} onBlur={onBlur} />
    );
    const input = wrapper.find('input');
    input.simulate('blur');

    expect(onBlur.called).toBeTruthy();
  });
});
