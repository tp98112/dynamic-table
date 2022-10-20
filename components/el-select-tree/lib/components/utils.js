/*!
 * el-select-tree v2.0.12
 * (c) 2019-2022 yujinpan
 * Released under the MIT License.
 */

import _toConsumableArray from '@babel/runtime/helpers/esm/toConsumableArray';
import 'core-js/modules/es.number.constructor.js';
import 'core-js/modules/es.object.to-string.js';
import 'core-js/modules/web.dom-collections.for-each.js';
import 'core-js/modules/es.set.js';
import 'core-js/modules/es.string.iterator.js';
import 'core-js/modules/web.dom-collections.iterator.js';
import 'core-js/modules/es.array.find.js';
import 'core-js/modules/es.array.includes.js';
import 'core-js/modules/es.string.includes.js';
import 'core-js/modules/es.array.from.js';
import 'core-js/modules/es.regexp.to-string.js';
import Vue from 'vue';

var ElSelectMixinOptions = {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    name: String,
    id: String,
    value: {
      required: true
    },
    autocomplete: String,
    autoComplete: String,
    automaticDropdown: Boolean,
    size: String,
    disabled: Boolean,
    clearable: Boolean,
    filterable: Boolean,
    allowCreate: Boolean,
    loading: Boolean,
    popperClass: String,
    remote: Boolean,
    loadingText: String,
    noMatchText: String,
    noDataText: String,
    remoteMethod: Function,
    filterMethod: Function,
    multiple: Boolean,
    multipleLimit: Number,
    placeholder: String,
    defaultFirstOption: Boolean,
    reserveKeyword: Boolean,
    valueKey: String,
    collapseTags: Boolean,
    popperAppendToBody: {
      type: Boolean,
      default: true
    }
  }
};
var ElSelectMixin = Vue.extend(ElSelectMixinOptions);
var ElTreeMixinOptions = {
  props: {
    data: Array,
    emptyText: String,
    renderAfterExpand: {
      type: Boolean,
      default: true
    },
    nodeKey: String,
    checkStrictly: Boolean,
    defaultExpandAll: Boolean,
    // expandOnClickNode: Boolean,
    // checkOnClickNode: Boolean,
    checkDescendants: Boolean,
    autoExpandParent: {
      type: Boolean,
      default: true
    },
    defaultCheckedKeys: Array,
    defaultExpandedKeys: Array,
    currentNodeKey: [String, Number],
    renderContent: Function,
    showCheckbox: Boolean,
    // draggable: Boolean,
    // allowDrag: Function,
    // allowDrop: Function,
    props: Object,
    lazy: Boolean,
    highlightCurrent: Boolean,
    load: Function,
    // filterNodeMethod: Function,
    accordion: Boolean,
    indent: Number,
    iconClass: String
  }
};
var ElTreeMixin = Vue.extend(ElTreeMixinOptions);
function propsPick(props, keys) {
  var result = {};
  keys.forEach(function (key) {
    key in props && (result[key] = props[key]);
  });
  return result;
}
function toArr(val) {
  return Array.isArray(val) ? val : val || val === 0 ? [val] : [];
}
function isValidArr(val) {
  return Array.isArray(val) && val.length;
}
function getParentKeys(currentKeys, data, getValByProp) {
  var result = new Set();
  var getKeys = function getKeys(tree) {
    tree.forEach(function (node) {
      var children = getValByProp('children', node);
      if (children && children.length) {
        if (children.find(function (item) {
          return currentKeys.includes(getValByProp('value', item));
        })) {
          result.add(getValByProp('value', node));
        }
        getKeys(children);
      }
    });
  };
  getKeys(data);
  return Array.from(result);
}
function cloneValue(val) {
  return Array.isArray(val) ? _toConsumableArray(val) : val;
}
function isEqualsValue(val1, val2) {
  return val1 === val2 || Array.isArray(val1) && Array.isArray(val2) && val1.toString() === val2.toString();
}

export { ElSelectMixin, ElSelectMixinOptions, ElTreeMixin, ElTreeMixinOptions, cloneValue, getParentKeys, isEqualsValue, isValidArr, propsPick, toArr };
