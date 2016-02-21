import assign from 'lodash.assign';
import 'classlist-polyfill';
import common from '../common';
import WebBundle from './WebBundle';
import AmdResolver from './AmdResolver';

export default assign( {}, common, {
  WebBundle,
  AmdResolver
});
