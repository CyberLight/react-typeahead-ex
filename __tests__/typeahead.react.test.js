import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import Typeahead from '../src/index';

const { expect } = global;

const SimpleOptionTemplate = (props) => {
  const getStyle = () => {
    if (props.selected) {
      return {
        backgroundColor: 'blue',
        color: 'white',
      };
    }
    return {};
  };
  return (
    <div className="rtex-option-item" style={getStyle()}>
      {props.data.name}
    </div>);
};

SimpleOptionTemplate.propTypes = {
  selected: React.PropTypes.bool,
  data: React.PropTypes.object,
};

beforeEach(() => {
  sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
});

afterEach(() => {
  /* eslint-disable no-console */
  console.error.restore();
  /* eslint-enable no-console */
});

it('Typeahead should raise error on ignoring optionTemplate prop', () => {
  try {
    mount(<Typeahead />);
  } catch (e) {
    expect(e.message).toContain('`optionTemplate` is marked as required');
  }
});

it('Typeahead should raise error on ignoring displayKey prop', () => {
  try {
    const templateFn = () => null;
    mount(<Typeahead optionTemplate={templateFn} />);
  } catch (e) {
    expect(e.message).toContain('`displayKey` is marked as required');
  }
});

it('Typeahead should display value', () => {
  const templateFn = () => null;
  const component = mount(
    <Typeahead
      value="test"
      displayKey={'name'}
      optionTemplate={templateFn}
    />);
  expect(component.find('.rtex-input').props().value).toEqual('test');
});

it('Typeahead should hide/display spinner', () => {
  const templateFn = () => null;
  const component = mount(
    <Typeahead
      value="test"
      showLoading
      displayKey={'name'}
      optionTemplate={templateFn}
    />);
  expect(component.find('.rtex-spinner').length).toEqual(1);

  component.setProps({ showLoading: false });

  expect(component.find('.rtex-spinner').length).toEqual(0);
});

it('Typeahead should raise onFetchData for not empty value', () => {
  const templateFn = () => null;

  const onFetchData = sinon.spy();

  mount(
    <Typeahead
      value="fetch"
      showLoading
      debounceRate={0}
      displayKey={'name'}
      optionTemplate={templateFn}
      onFetchData={onFetchData}
    />);

  expect(onFetchData.called).toBeTruthy();
});

it('Typeahead should raise onChange when value changed', () => {
  const templateFn = () => null;
  const onChange = sinon.spy();

  const component = mount(
    <Typeahead
      value="change"
      showLoading
      displayKey={'name'}
      optionTemplate={templateFn}
      onChange={onChange}
    />);

  const event = { target: { value: 'value changed' } };
  component.find('.rtex-input').at(0).simulate('change', event);
  expect(onChange.called).toBeTruthy();
});

it('Typeahead should show list of items when Down Arrow key presses', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="change"
      showLoading
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  component.find('.rtex-input').at(0).simulate('keyDown', { key: 'ArrowDown' });
  const container = component.find('.rtex-is-open');
  expect(container.length).toEqual(1);
  const items = container.find('.rtex-option-item');
  expect(items.length).toEqual(3);
});
