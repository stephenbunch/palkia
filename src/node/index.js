import assign from 'lodash.assign';
import common from '../common';
import NodeBundle from './NodeBundle';
import CommonJsResolver from './CommonJsResolver';

export default assign( {}, common, {
  NodeBundle,
  CommonJsResolver
});
