/*!
 * el-select-tree v2.0.12
 * (c) 2019-2022 yujinpan
 * Released under the MIT License.
 */

import _toConsumableArray from '@babel/runtime/helpers/esm/toConsumableArray';
import _objectSpread from '@babel/runtime/helpers/esm/objectSpread2';
import _initializerDefineProperty from '@babel/runtime/helpers/esm/initializerDefineProperty';
import _classCallCheck from '@babel/runtime/helpers/esm/classCallCheck';
import _createClass from '@babel/runtime/helpers/esm/createClass';
import _assertThisInitialized from '@babel/runtime/helpers/esm/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/esm/inherits';
import _createSuper from '@babel/runtime/helpers/esm/createSuper';
import _defineProperty from '@babel/runtime/helpers/esm/defineProperty';
import _applyDecoratedDescriptor from '@babel/runtime/helpers/esm/applyDecoratedDescriptor';
import '@babel/runtime/helpers/esm/initializerWarningHelper';
import 'core-js/modules/es.array.concat.js';
import 'core-js/modules/es.object.to-string.js';
import 'core-js/modules/web.dom-collections.iterator.js';
import 'core-js/modules/es.object.keys.js';
import 'core-js/modules/es.array.filter.js';
import 'core-js/modules/es.array.includes.js';
import 'core-js/modules/es.string.includes.js';
import 'core-js/modules/es.array.slice.js';
import 'core-js/modules/es.array.find.js';
import 'core-js/modules/es.array.map.js';
import 'core-js/modules/es.object.get-own-property-descriptor.js';
import Vue from 'vue';
import { Component, Ref, Watch, Mixins } from 'vue-property-decorator';
import 'core-js/modules/es.number.constructor.js';
import 'core-js/modules/web.dom-collections.for-each.js';
import 'core-js/modules/es.set.js';
import 'core-js/modules/es.string.iterator.js';
import 'core-js/modules/es.array.from.js';
import 'core-js/modules/es.regexp.to-string.js';
import styleInject from 'style-inject/dist/style-inject.es.js';
import __vue_normalize__ from 'vue-runtime-helpers/dist/normalize-component.js';

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

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2;
var ElSelectTree = (_dec = Component({
  name: 'ElSelectTree'
}), _dec2 = Ref('select'), _dec3 = Ref('tree'), _dec4 = Watch('privateValue'), _dec5 = Watch('value', {
  deep: true,
  immediate: true
}), _dec6 = Watch('data'), _dec7 = Watch('defaultExpandedKeys', {
  immediate: true
}), _dec(_class = (_class2 = /*#__PURE__*/function (_Mixins) {
  _inherits(ElSelectTree, _Mixins);
  var _super = _createSuper(ElSelectTree);
  function ElSelectTree() {
    var _this;
    _classCallCheck(this, ElSelectTree);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _initializerDefineProperty(_assertThisInitialized(_this), "select", _descriptor, _assertThisInitialized(_this));
    _initializerDefineProperty(_assertThisInitialized(_this), "tree", _descriptor2, _assertThisInitialized(_this));
    _defineProperty(_assertThisInitialized(_this), "privateValue", null);
    _defineProperty(_assertThisInitialized(_this), "_defaultExpandedKeys", []);
    return _this;
  }
  _createClass(ElSelectTree, [{
    key: "render",
    value: function render(h) {
      var _this2 = this;
      if (!Vue.component('ElSelect') || !Vue.component('ElTree') || !Vue.component('ElOption')) {
        throw new Error("[ElSelectTree]: ElSelect/ElTree/ElOption unregistered.");
      }
      var slots = [];
      this.$slots.prefix && slots.push(h('template', {
        slot: 'prefix'
      }, this.$slots.prefix));
      this.$slots.empty && slots.push(h('template', {
        slot: 'empty'
      }, this.$slots.empty));
      return h('el-select', {
        ref: 'select',
        props: _objectSpread(_objectSpread({}, this.propsElSelect), {}, {
          value: this.privateValue,
          popperClass: "el-select-tree__popper ".concat(this.propsElSelect.popperClass || ''),
          filterMethod: this._filterMethod
        }),
        on: _objectSpread(_objectSpread({}, this.$listeners), {}, {
          change: function change(val) {
            _this2.privateValue = val;
          },
          'visible-change': this._visibleChange
        })
      }, [].concat(slots, [h('el-tree', {
        ref: 'tree',
        props: _objectSpread(_objectSpread({}, this.propsElTree), {}, {
          expandOnClickNode: !this.checkStrictly,
          filterNodeMethod: this._filterNodeMethod,
          nodeKey: this.propsMixin.value,
          defaultExpandedKeys: this._defaultExpandedKeys,
          renderContent: this._renderContent
        }),
        on: _objectSpread(_objectSpread({}, this.$listeners), {}, {
          'node-click': this._nodeClick,
          check: this._check
        })
      })]));
    }
  }, {
    key: "mounted",
    value: function mounted() {
      var _this3 = this;
      // get ElTree/ElSelect all methods
      this.$nextTick(function () {
        ['focus', 'blur'].forEach(function (item) {
          _this3[item] = _this3.select[item];
        });
        ['filter', 'updateKeyChildren', 'getCheckedNodes', 'setCheckedNodes', 'getCheckedKeys', 'setCheckedKeys', 'setChecked', 'getHalfCheckedNodes', 'getHalfCheckedKeys', 'getCurrentKey', 'getCurrentNode', 'setCurrentKey', 'setCurrentNode', 'getNode', 'remove', 'append', 'insertBefore', 'insertAfter'].forEach(function (item) {
          _this3[item] = _this3.tree[item];
        });
      });
    }
  }, {
    key: "values",
    get: function get() {
      return toArr(this.value);
    }

    /**
     * change from current component
     * @private
     */
  }, {
    key: "onPrivateValueChange",
    value: function onPrivateValueChange(val) {
      var _this4 = this;
      // update when difference only
      if (!isEqualsValue(val, this.value)) {
        this.$emit('change', cloneValue(val));
      }
      if (this.showCheckbox) {
        this.$nextTick(function () {
          _this4.tree.setCheckedKeys(_this4.values);
        });
      }
    }

    /**
     * change from user assign value
     */
  }, {
    key: "onValueChange",
    value: function onValueChange(val) {
      // update when difference only
      if (!isEqualsValue(val, this.privateValue)) {
        this.privateValue = cloneValue(val);
        this._updateDefaultExpandedKeys();
      }
    }

    // Expand the parent node of the selected node by default,
    // "default" is the value/data/defaultExpandedKeys
    // changed from user assign value, rather than current component
  }, {
    key: "_updateDefaultExpandedKeys",
    value: function _updateDefaultExpandedKeys() {
      var parentKeys = isValidArr(this.values) && isValidArr(this.data) ? getParentKeys(this.values, this.data, this.getValByProp) : [];
      return this._defaultExpandedKeys = this.defaultExpandedKeys ? this.defaultExpandedKeys.concat(parentKeys) : parentKeys;
    }
  }, {
    key: "propsElSelect",
    get: function get() {
      return propsPick(this.$props, Object.keys(ElSelectMixinOptions.props));
    }
  }, {
    key: "propsElTree",
    get: function get() {
      return _objectSpread(_objectSpread({}, propsPick(this.$props, Object.keys(ElTreeMixinOptions.props))), {}, {
        props: this.propsMixin
      });
    }

    /**
     * 禁止直接引用，通过 getValByProp 获取节点值
     */
  }, {
    key: "propsMixin",
    get: function get() {
      return _objectSpread({
        value: this.nodeKey || 'value',
        label: 'label',
        children: 'children',
        disabled: 'disabled',
        isLeaf: 'isLeaf'
      }, this.props);
    }

    /**
     * 获取节点的 prop 对应的值
     */
  }, {
    key: "getValByProp",
    value: function getValByProp(prop, data) {
      var propVal = this.propsMixin[prop];
      if (propVal instanceof Function) {
        var _this$tree;
        return propVal(data, (_this$tree = this.tree) === null || _this$tree === void 0 ? void 0 : _this$tree.getNode(this.getValByProp('value', data)));
      } else {
        return data[propVal];
      }
    }
  }, {
    key: "_renderContent",
    value: function _renderContent(h, _ref) {
      var node = _ref.node,
        data = _ref.data,
        store = _ref.store;
      var ElSelectTreeOption = {
        extends: Vue.component('ElOption'),
        methods: {
          // 拦截点击事件，事件移至 node 节点上
          selectOptionClick: function selectOptionClick() {
            // $parent === slot-scope
            // $parent.$parent === el-tree-node
            this.$parent.$parent.handleClick();
          }
        }
      };
      return h(ElSelectTreeOption, {
        props: {
          value: this.getValByProp('value', data),
          label: this.getValByProp('label', data),
          disabled: this.getValByProp('disabled', data)
        }
      }, this.renderContent ? [this.renderContent(h, {
        node: node,
        data: data,
        store: store
      })] : this.$scopedSlots.default ? this.$scopedSlots.default({
        node: node,
        data: data,
        store: store
      }) : undefined);
    }

    // el-select 的 query 事件转发至 el-tree 中
  }, {
    key: "_filterMethod",
    value: function _filterMethod() {
      var _this$filterMethod,
        _this5 = this;
      var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      (_this$filterMethod = this.filterMethod) === null || _this$filterMethod === void 0 ? void 0 : _this$filterMethod.call(this, val);

      // fix: `tree` reference is empty when component destroy
      // https://github.com/yujinpan/el-select-tree/issues/35
      this.$nextTick(function () {
        _this5.tree && _this5.tree.filter(val);
      });
    }
  }, {
    key: "_filterNodeMethod",
    value: function _filterNodeMethod(value, data, node) {
      var _this$getValByProp;
      // fix: https://github.com/yujinpan/el-select-tree/issues/35
      if (this.filterMethod) return this.filterMethod(value, data, node);
      if (!value) return true;
      return (_this$getValByProp = this.getValByProp('label', data)) === null || _this$getValByProp === void 0 ? void 0 : _this$getValByProp.includes(value);
    }

    // can not select
  }, {
    key: "_nodeClick",
    value: function _nodeClick(data, node, component) {
      var _this$$listeners$node, _this$$listeners;
      (_this$$listeners$node = (_this$$listeners = this.$listeners)['node-click']) === null || _this$$listeners$node === void 0 ? void 0 : _this$$listeners$node.call.apply(_this$$listeners$node, [_this$$listeners].concat(Array.prototype.slice.call(arguments)));
      if (this.canSelect(node)) {
        if (!this.getValByProp('disabled', data)) {
          var elOptionSlot = component.$children.find(function (item) {
            return item.$options._componentTag === 'node-content';
          });
          var elOption = elOptionSlot.$children[0];
          elOption.dispatch('ElSelect', 'handleOptionClick', [elOption, true]);
        }
      } else {
        component.handleExpandIconClick();
      }
    }

    // clear filter text when visible change
  }, {
    key: "_visibleChange",
    value: function _visibleChange(val) {
      var _this$$listeners$visi, _this$$listeners2;
      (_this$$listeners$visi = (_this$$listeners2 = this.$listeners)['visible-change']) === null || _this$$listeners$visi === void 0 ? void 0 : _this$$listeners$visi.call.apply(_this$$listeners$visi, [_this$$listeners2].concat(Array.prototype.slice.call(arguments)));
      if (this.filterable && val) {
        this._filterMethod();
      }
    }

    // set selected when check change
  }, {
    key: "_check",
    value: function _check(data, params) {
      var _this$$listeners$chec,
        _this$$listeners3,
        _this6 = this;
      (_this$$listeners$chec = (_this$$listeners3 = this.$listeners)['check']) === null || _this$$listeners$chec === void 0 ? void 0 : _this$$listeners$chec.call.apply(_this$$listeners$chec, [_this$$listeners3].concat(Array.prototype.slice.call(arguments)));
      var checkedKeys = params.checkedKeys,
        checkedNodes = params.checkedNodes;

      // remove folder node when `checkStrictly` is false
      if (!this.checkStrictly) {
        checkedKeys = checkedNodes.filter(function (item) {
          return !isValidArr(_this6.getValByProp('children', item));
        }).map(function (item) {
          return _this6.getValByProp('value', item);
        });
      }
      this.privateValue = this.multiple ? _toConsumableArray(checkedKeys) : checkedKeys.includes(this.getValByProp('value', data)) ? this.getValByProp('value', data) : undefined;
    }
  }, {
    key: "canSelect",
    value: function canSelect(data) {
      return this.checkStrictly || this.getValByProp('isLeaf', data);
    }
  }]);
  return ElSelectTree;
}(Mixins(ElSelectMixin, ElTreeMixin)), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "select", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "tree", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2.prototype, "onPrivateValueChange", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "onPrivateValueChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onValueChange", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "onValueChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_updateDefaultExpandedKeys", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "_updateDefaultExpandedKeys"), _class2.prototype)), _class2)) || _class);

var css_248z = ".el-select-tree__popper .el-checkbox__input{display:-webkit-box;display:-ms-flexbox;display:flex}.el-select-tree__popper .el-select-dropdown__item{-webkit-box-flex:1;background:0 0!important;-ms-flex:1;flex:1;height:20px;line-height:20px;padding:0 30px 0 0}.el-select-tree__popper .el-select-dropdown__item.selected:after{right:10px}";
styleInject(css_248z);

/* script */
var __vue_script__ = ElSelectTree;
/* template */

/* style */
var __vue_inject_styles__ = undefined;
/* scoped */
var __vue_scope_id__ = undefined;
/* module identifier */
var __vue_module_identifier__ = undefined;
/* functional template */
var __vue_is_functional_template__ = undefined;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/__vue_normalize__({}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

// 主组件

// Vue.use()
// @ts-ignore
__vue_component__.install = function (Vue) {
  Vue.component('ElSelectTree', __vue_component__);
};

export { __vue_component__ as default };
