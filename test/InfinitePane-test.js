/* global describe it context */

import _ from 'lodash';
import React from 'react';
import { expect } from 'chai';
import { shallow, render } from 'enzyme';

import InfinitePane from '../src/InfinitePane';

class Dummy extends React.Component {
  render() {
    const { listIndex } = this.props;
    return <div style={{ width: 100, height: 100 }}>Item #{listIndex}!</div>;
  }
}

describe('<InfinitePane />', () => {
  let list = _.times(100, i => ({ listIndex: i + 1 }));
  let infinitePane = (
    <InfinitePane
      Component={Dummy}
      list={list}
      totalCount={list.length}
    />
  );

  it('contains the buffer nodes', () => {
    expect(shallow(infinitePane).find('> div')).to.have.length(2);
  });

  context('when scrolled to the top', () => {
    it('contains the first node', () => {
      expect(render(infinitePane).text()).to.contain('Item #1!');
    });

    it('does not contain the last node', () => {
      expect(render(infinitePane).html()).to.not.contain('Item #100!');
    });
  });

  context('when scrolled to the bottom', () => {
    it('contains the first node', () => {
      const wrapper = render(infinitePane);
      global.window.scrollTo(0,global.document.body.scrollHeight);
      expect(wrapper.text()).to.contain('Item #100!');
    });

    it('does not contain the last node', () => {
      const wrapper = render(infinitePane);
      global.window.scrollTo(0,global.document.body.scrollHeight);
      expect(wrapper.text()).to.not.contain('Item #1!');
    });
  });

});
