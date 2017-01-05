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

  const getClasses = () => {
    if (props.selected) {
      return 'rtex-option-item rtex-option-selected';
    }
    return 'rtex-option-item';
  };

  return (
    <div className={getClasses()} style={getStyle()}>
      {props.data.name}
    </div>);
};

SimpleOptionTemplate.propTypes = {
  selected: React.PropTypes.bool,
  data: React.PropTypes.object,
};

const documentEventsMap = {};

beforeEach(() => {
  sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  sinon.stub(document, 'addEventListener', (event, cb) => {
    documentEventsMap[event] = cb;
  });
});

afterEach(() => {
  /* eslint-disable no-console */
  console.error.restore();
  /* eslint-enable no-console */
  document.addEventListener.restore();
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

it('Typeahead should move selection for item when ArrowDown pressed', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value=""
      showLoading
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const selectedItem1 = component.find('.rtex-is-open .rtex-option-selected');
  expect(selectedItem1.text()).toEqual('value 1');

  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const selectedItem2 = component.find('.rtex-is-open .rtex-option-selected');
  expect(selectedItem2.text()).toEqual('value 2');

  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const selectedItem3 = component.find('.rtex-is-open .rtex-option-selected');
  expect(selectedItem3.text()).toEqual('value 3');

  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const selectedItem1Again = component.find('.rtex-is-open .rtex-option-selected');
  expect(selectedItem1Again.text()).toEqual('value 1');
});

it('Typeahead should move selection for item when ArrowUp pressed', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value=""
      showLoading
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('keyDown', { key: 'ArrowUp' });
  const selectedItem2 = component.find('.rtex-is-open .rtex-option-selected');
  expect(selectedItem2.text()).toEqual('value 2');

  inputComponent.simulate('keyDown', { key: 'ArrowUp' });
  const selectedItem3 = component.find('.rtex-is-open .rtex-option-selected');
  expect(selectedItem3.text()).toEqual('value 1');

  inputComponent.simulate('keyDown', { key: 'ArrowUp' });
  const selectedItem2Again = component.find('.rtex-is-open .rtex-option-selected');
  expect(selectedItem2Again.text()).toEqual('value 3');

  inputComponent.simulate('keyDown', { key: 'ArrowUp' });
  const selectedItem1 = component.find('.rtex-is-open .rtex-option-selected');
  expect(selectedItem1.text()).toEqual('value 2');
});

it('Typeahead should show options on focus and hide options when <Esc> pressed', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="value 1"
      showLoading
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);

  inputComponent.simulate('focus');
  expect(component.find('.rtex-is-open').length).toEqual(1);

  inputComponent.simulate('keyDown', { key: 'Esc' });
  expect(component.find('.rtex-is-open').length).toEqual(0);
});

it('Typeahead should select item by press <Enter>', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="value 1"
      showLoading
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('focus');
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  inputComponent.simulate('keyDown', { key: 'Enter' });
  expect(inputComponent.prop('value')).toEqual('value 2');
  expect(component.find('.rtex-is-open').length).toEqual(0);
});

test('Typeahead should show hint for value', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="valu"
      showLoading
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const hintComponent = component.find('.rtex-hint').at(0);
  expect(hintComponent.prop('value')).toEqual('value 1');

  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const hintComponent2 = component.find('.rtex-hint').at(0);
  expect(hintComponent2.prop('value')).toEqual('value 2');

  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const hintComponent3 = component.find('.rtex-hint').at(0);
  expect(hintComponent3.prop('value')).toEqual('value 3');
});

test('Typeahead should not show hint if hint disabled', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="valu"
      showLoading
      hint={false}
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const hintComponent = component.find('.rtex-hint').at(0);
  expect(hintComponent.prop('value')).toEqual('');
});

test('Typeahead should autocomplete by press <Tab> by hint for value', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="valu"
      showLoading
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const hintComponent = component.find('.rtex-hint').at(0);
  expect(hintComponent.prop('value')).toEqual('value 2');
  inputComponent.simulate('keyDown', { key: 'Tab' });
  expect(inputComponent.prop('value')).toEqual('value 2');
});

test('Typeahead should autocomplete by press <End> by hint for value', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="valu"
      showLoading
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const hintComponent = component.find('.rtex-hint').at(0);
  expect(hintComponent.prop('value')).toEqual('value 2');
  inputComponent.simulate('keyDown', { key: 'End' });
  expect(inputComponent.prop('value')).toEqual('value 2');
});

test('Typeahead should not autocomplete by press <Tab> if hint disabled', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="valu"
      showLoading
      hint={false}
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const hintComponent = component.find('.rtex-hint').at(0);
  expect(hintComponent.prop('value')).toEqual('');
  inputComponent.simulate('keyDown', { key: 'Tab' });
  expect(inputComponent.prop('value')).toEqual('valu');
});

test('Typeahead should not autocomplete by press <End> if hint disabled', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="valu"
      showLoading
      hint={false}
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  const hintComponent = component.find('.rtex-hint').at(0);
  expect(hintComponent.prop('value')).toEqual('');
  inputComponent.simulate('keyDown', { key: 'End' });
  expect(inputComponent.prop('value')).toEqual('valu');
});

test('Typeahead should select option by click on it', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value="valu"
      showLoading
      hint={false}
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('focus');
  const container = component.find('.rtex-is-open');
  container.find('.rtex-option-item').at(1).simulate('click', {
    nativeEvent: { stopImmediatePropagation: () => {} },
  });
  expect(inputComponent.prop('value')).toEqual('value 2');
  const containerClosed = component.find('.rtex-is-open');
  expect(containerClosed.length).toEqual(0);
});

test('Typeahead should close option list if click on different div', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <div>
      <Typeahead
        value="valu"
        showLoading
        hint={false}
        displayKey={'name'}
        options={options}
        optionTemplate={SimpleOptionTemplate}
      />
    </div>);

  const inputComponent = component.find('.rtex-input').at(0);
  inputComponent.simulate('keyDown', { key: 'ArrowDown' });
  expect(component.find('.rtex-is-open').length).toEqual(1);

  documentEventsMap.click();

  expect(component.find('.rtex-is-open').length).toEqual(0);
});

test('Typeahead should move spinner to left for RTL when chnage event raised', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  sinon.stub(window, 'getComputedStyle', () => ({ direction: 'rtl' }));

  const component = mount(
    <div>
      <Typeahead
        value="valu"
        showLoading
        hint={false}
        displayKey={'name'}
        options={options}
        optionTemplate={SimpleOptionTemplate}
      />
    </div>);
  const event = { target: { value: 'value changed' } };
  component.find('.rtex-input').at(0).simulate('change', event);

  window.getComputedStyle.restore();

  expect(component.find('.rtex-spinner').prop('dir')).toEqual('rtl');
});


test('Typeahead should move spinner to left for RTL when new props sets', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  sinon.stub(window, 'getComputedStyle', () => ({ direction: 'rtl' }));

  const component = mount(
    <Typeahead
      value="valu"
      showLoading
      hint={false}
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  component.setProps({ value: 'value 1' });

  window.getComputedStyle.restore();

  expect(component.find('.rtex-spinner').prop('dir')).toEqual('rtl');
});

test('Typeahead should set default value for minLength', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value=""
      showLoading
      hint={false}
      displayKey={'name'}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  expect(component.prop('minLength')).toEqual(1);
});

test('Typeahead should raise Fetch event if value >= minLength', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const onFetchData = sinon.spy();

  const component = mount(
    <Typeahead
      value=""
      showLoading
      hint={false}
      displayKey={'name'}
      minLength={4}
      options={options}
      optionTemplate={SimpleOptionTemplate}
      onFetchData={onFetchData}
    />);

  const event = { target: { value: 'v' } };
  component.find('.rtex-input').at(0).simulate('change', event);

  expect(onFetchData.callCount).toEqual(0);

  const event2 = { target: { value: 'val' } };
  component.find('.rtex-input').at(0).simulate('change', event2);

  expect(onFetchData.callCount).toEqual(0);

  const event3 = { target: { value: 'valu' } };
  component.find('.rtex-input').at(0).simulate('change', event3);

  expect(onFetchData.callCount).toEqual(1);

  const event4 = { target: { value: 'value' } };
  component.find('.rtex-input').at(0).simulate('change', event4);

  expect(onFetchData.callCount).toEqual(2);
});

test('Typeahead should receive rateLimitBy types ["none", "trottle", "debounce"]', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value=""
      hint={false}
      displayKey={'name'}
      minLength={4}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  expect(component.prop('rateLimitBy')).toEqual('none');

  expect(() => {
    component.setProps({ rateLimitBy: 'trottle' });
  }).not.toThrow();
  expect(component.prop('rateLimitBy')).toEqual('trottle');

  expect(() => {
    component.setProps({ rateLimitBy: 'debounce' });
  }).not.toThrow();
  expect(component.prop('rateLimitBy')).toEqual('debounce');

  expect(() => {
    component.setProps({ rateLimitBy: 'none' });
  }).not.toThrow();
  expect(component.prop('rateLimitBy')).toEqual('none');

  expect(() => {
    component.setProps({ rateLimitBy: 'unknown' });
  }).toThrowError(/Invalid prop `rateLimitBy` of value `unknown`/);
});

test('Typeahead should set rateLimitWait as number', () => {
  const options = [
    { id: 1, name: 'value 1' },
    { id: 2, name: 'value 2' },
    { id: 3, name: 'value 3' },
  ];

  const component = mount(
    <Typeahead
      value=""
      hint={false}
      displayKey={'name'}
      minLength={4}
      options={options}
      optionTemplate={SimpleOptionTemplate}
    />);

  expect(component.prop('rateLimitWait')).toEqual(0);

  expect(() => {
    component.setProps({ rateLimitWait: '100' });
  }).toThrowError(/Invalid prop `rateLimitWait` of type `string`/);
});
