<template>
  <el-form
    :model="form"
    :rules="rules"
    :disabled="disabledForm"
    ref="dynamic-form"
    :label-width="getFormLabelWidth"
    :label-position="labelPosition"
    :style="{ marginLeft: -gutter / 2 + 'px' }"
    :class="{
      'dynamic-form': true,
      'form-items-cover': formItemsCover,
    }"
  >
    <template v-for="(item, index) in getFormItems">
      <el-form-item
        :style="{
          width: formItemWidth(item),
          paddingLeft: gutter / 2 + 'px',
          paddingRight: gutter / 2 + 'px',
          flex: item.flex
        }"
        :ref="`el-form-item-${item.prop}`"
        :key="index"
        :prop="getProp(item)"
        :label="item.formLabel ? item.formLabel : item.label ? item.label : ''"
        :label-width="item.formLabelWidth"
        v-if="getFormVisible(item)"
      >
        <slot :name="'form-' + item.prop" v-bind="{ form, mode: '' }">
          <renderColumn
            v-if="typeof item.render === 'function'"
            :renderContent="item.render"
            :data="{ form, mode: '' }"
          ></renderColumn>
          <template v-else>
            <!-- 文本输入框 -->
            <el-input
              v-if="isRender(item.editType, 'input')"
              v-model="form[getProp(item)]"
              v-on:[controlEvent(item)]="controlMethod($event, item)"
              v-on="getControlEvents(item)"
              :size="size"
              v-bind="returnControlProperty(item)"
              :disabled="setDisabled(item.disabled)"
              :readonly="setReadonly(item.readonly)"
            >
              <div
                v-on:[controlEvent(item)]="controlMethod($event, item)"
                v-on="getControlEvents(item)"
                v-if="item.appendText || item.appendIcon"
                slot="append"
              >
                <i
                  v-if="item.appendIcon"
                  :class="item.appendIcon"
                  style="margin-right: 4px"
                ></i>
                <span v-if="item.appendText">{{ item.appendText }}</span>
              </div>
            </el-input>
            <!-- 下拉选择框 -->
            <el-select
              v-else-if="isRender(item.editType, 'select')"
              v-model="form[item.prop]"
              v-on:[controlEvent(item)]="controlMethod($event, item)"
              v-on="getControlEvents(item)"
              :size="size"
              v-bind="returnControlProperty(item)"
              :disabled="setDisabled(item.disabled)"
              :readonly="setReadonly(item.readonly)"
              style="width: 100%"
            >
              <el-option
                v-for="(opt, optIndex) in returnOptions(item)"
                :key="optIndex"
                :label="returnOptionsFields(item, opt, 'label')"
                :value="returnOptionsFields(item, opt, 'value')"
              >
              </el-option>
            </el-select>
            <!-- 日期选择器 -->
            <el-date-picker
              v-else-if="isRender(item.editType, 'date-picker')"
              v-model="form[item.prop]"
              v-on:[controlEvent(item)]="controlMethod($event, item)"
              v-on="getControlEvents(item)"
              :size="size"
              v-bind="returnControlProperty(item)"
              :disabled="setDisabled(item.disabled)"
              :readonly="setReadonly(item.readonly)"
              style="width: 100%"
            ></el-date-picker>
            <!-- 单选框组 -->
            <el-radio-group
              v-else-if="isRender(item.editType, 'radio-group')"
              v-model="form[item.prop]"
              v-on:[controlEvent(item)]="controlMethod($event, item)"
              v-on="getControlEvents(item)"
              :size="size"
              v-bind="returnControlProperty(item)"
            >
              <el-radio
                v-for="(opt, optIndex) of returnOptions(item)"
                :key="optIndex"
                :label="returnOptionsFields(item, opt, 'value')"
              >
                {{ returnOptionsFields(item, opt, 'label') }}
              </el-radio>
            </el-radio-group>
            <!-- switch开关 -->
            <el-switch
              v-else-if="isRender(item.editType, 'switch')"
              v-model="form[item.prop]"
              v-on:[controlEvent(item)]="controlMethod($event, item)"
              v-on="getControlEvents(item)"
              :size="size"
              v-bind="returnControlProperty(item)"
              :disabled="setDisabled(item.disabled)"
              :readonly="setReadonly(item.readonly)"
            ></el-switch>
            <!-- 链接 -->
            <el-link
              v-else-if="isRender(item.editType, 'link')"
              :size="size"
              v-bind="returnControlProperty(item)"
              :disabled="setDisabled(item.disabled)"
              :readonly="setReadonly(item.readonly)"
              v-on:[controlEvent(item)]="controlMethod($event, item)"
              v-on="getControlEvents(item)"
              >{{ item.linkText ? item.linkText : "默认链接" }}
            </el-link>
            <!-- 时间范围选择器 -->
            <template v-else-if="isRender(item.editType, 'time-picker')">
              <el-time-picker
                v-model="form[item.prop]"
                v-on:[controlEvent(item)]="controlMethod($event, item)"
                v-on="getControlEvents(item)"
                :size="size"
                v-bind="returnControlProperty(item)"
                :disabled="setDisabled(item.disabled)"
                :readonly="setReadonly(item.readonly)"
                style="width: 100%"
              >
              </el-time-picker>
            </template>
            <!-- 多选框组 -->
            <template v-else-if="isRender(item.editType, 'checkbox-group')">
              <el-checkbox-group
                v-model="form[item.prop]"
                v-on:[controlEvent(item)]="controlMethod($event, item)"
                v-on="getControlEvents(item)"
                :size="size"
                v-bind="returnControlProperty(item)"
                :disabled="setDisabled(item.disabled)"
                :readonly="setReadonly(item.readonly)"
              >
                <el-checkbox
                  v-for="(opt, optIndex) of returnOptions(item)"
                  :key="optIndex"
                  :label="returnOptionsFields(item, opt, 'value')"
                >
                  {{returnOptionsFields(item, opt, 'label')}}
                </el-checkbox>
              </el-checkbox-group>
            </template>
            <!-- 计数器 -->
            <el-input-number
              v-else-if="isRender(item.editType, 'input-number')"
              v-model="form[item.prop]"
              v-on:[controlEvent(item)]="controlMethod($event, item)"
              v-on="getControlEvents(item)"
              :size="size"
              v-bind="returnControlProperty(item)"
              :disabled="setDisabled(item.disabled)"
              :readonly="setReadonly(item.readonly)"
            ></el-input-number>
            <!-- 级联选择器 -->
            <el-cascader
              v-else-if="isRender(item.editType, 'cascader')"
              :ref="'cascader-' + item.prop"
              :size="size"
              v-bind="returnControlProperty(item)"
              v-model="form[item.prop]"
              v-on:[controlEvent(item)]="controlMethod($event, item)"
              v-on="getControlEvents(item)"
              :options="returnOptions(item)"
              style="width: 100%"
              :disabled="setDisabled(item.disabled)"
              :readonly="setReadonly(item.readonly)"
            ></el-cascader>
            <!-- 远程搜索 -->
            <el-autocomplete
              v-else-if="isRender(item.editType, 'autocomplete')"
              v-model="form[item.prop]"
              :size="size"
              v-bind="returnControlProperty(item)"
              v-on:[controlEvent(item)]="controlMethod($event, item)"
              v-on="getControlEvents(item)"
              :disabled="setDisabled(item.disabled)"
              :readonly="setReadonly(item.readonly)"
              style="width: 100%"
            ></el-autocomplete>
            <!-- 上传按钮 -->
            <tp-upload-button 
                v-else-if="item.editType === 'upload-button'"
                @change="submitFormValidation(item, 'change')"
                :control="returnControlProperty(item)"
                :size="item.size"
                :fileList="form[item.prop]" >
            </tp-upload-button>
            <!-- 照片墙图片上传 -->
            <tp-upload-images 
            v-else-if="item.editType === 'upload-image'"
            @change="setUploadImage($event, item)"
            :control="returnControlProperty(item)"
            :file="form[item.prop]" 
            ></tp-upload-images>
            <!-- 上传下拉选择器 -->
            <div
              v-else-if="isRender(item.editType, 'upload-select')"
              style="display: flex; align-items: center"
            >
              <el-select
                v-model="otherData[item.prop + '-selected']"
                @change="fileSelectChange($event, item)"
                multiple
                :size="size"
                style="width: 100%; margin-right: 5px"
              >
                <el-option
                  v-for="item in otherData[item.prop + '-list']"
                  :key="item.uid"
                  :label="item.name"
                  :value="item.uid"
                >
                </el-option>
              </el-select>
              <el-upload
                v-bind="returnControlProperty(item)"
                :file-list="form[item.prop]"
                :show-file-list="false"
                :on-exceed="
                  (file, fileList) => {
                    exceedQuantityLimit(file, fileList, item);
                  }
                "
                :on-change="
                  (file, fileList) => {
                    fileSelectUpload(file, fileList, item);
                  }
                "
                style="line-height: initial"
              >
                <el-badge
                  :value="form[item.prop].length"
                  :hidden="form[item.prop].length === 0"
                  class="item"
                  type="primary"
                >
                  <el-button :size="size" type="primary">点击上传</el-button>
                </el-badge>
              </el-upload>
            </div>
            <el-select-tree 
            v-else-if="isRender(item.editType, 'select-tree')"
            v-model="form[item.prop]"
            v-bind="returnControlProperty(item)"
            v-on:[controlEvent(item)]="controlMethod($event, item)"
            v-on="getControlEvents(item)"
            :data="returnOptions(item)"
            :size="size"
            style="width: 100%"
            />
            <!-- 按钮组 -->
            <div v-else-if="isRender(item.editType, 'button-group')" :style="{display: 'flex', alignItems: 'center',height: '100%', justifyContent: item.justifyContent}">
              <el-button
                v-for="(opt, index) of item.options"
                :key="index"
                @click="customButtonEvents(opt)"
                :type="opt.type"
                :icon="opt.icon"
                :title="opt.title"
                :plain="opt.plain"
                :round="opt.round"
                :circle="opt.circle"
                :disabled="setDisabled(opt.disabled)"
                :size="opt.size"
                >{{ opt.label }}</el-button
              >
            </div>
            <span v-else class="unknown-span">{{ form[item.prop] }}</span>
          </template>
        </slot>
      </el-form-item>
    </template>
  </el-form>
</template>

<script>
import { typeOf } from 'mathjs';
import { getId } from "../../tools.js";
const renderColumn = {
  props: {
    data: Object,
    renderContent: Function,
  },
  render(h) {
    return this.renderContent(h, this.data);
  },
};
export default {
  /**
   * 动态表单
   */
  name: "TpDynamicForm",
  inheritAttrs: false, // 未声明接收的prop不显示在dom上
  components: {
    renderColumn,
    TpUploadButton: () => import('../TpUpload/Button.vue'),
    TpUploadImages: () => import('../TpUpload/Image.vue'),
  },
  props: {
    column: {
      type: Array,
      default() {
        return [];
      },
    },
    cols: {
      // 将一行分成cols份
      type: [Number, String],
      default: 1,
    },
    colsWidth: {
      // 设置为 'auto' 并且 formItemsCover 为false时即是elementUi表单的原始排版效果
      type: String,
    },
    size: {
      // 表单控件尺寸
      type: String,
      default: "small",
    },
    gutter: {
      type: Number,
      default: 20,
    },
    currentMode: {
      // 当前操作模式
      type: [String, Number],
    },
    disabledForm: {
      // 表单禁用
      type: Boolean,
      default: false,
    },
    currentPanel: {
      // 当前面板
      type: [String, Number],
    },
    dataIsolation: {
      // 当存在不同面板时 是否启用数据隔离
      type: Boolean,
      default: false,
    },
    initFields: {
      // 初始化字段 可在此设置字段默认值
      type: Object,
      default() {
        return {};
      },
    },
    received_dicts: {
      // 接收表格字典
      type: Object,
      default() {
        return {};
      },
    },
    labelPosition: {
      // 表单标签对齐方式
      type: String,
      default: "center",
    },
    formLabelWidth: {
      // 表单标签宽度 px
      type: [Number, String],
    },
    formLabelFontSize: {
      // 表单标签字体大小 用以自动计算表单标签宽度,
      // 如若通过css修改了字体大小 ,请传递该值告知或在此处修改默认值
      type: [Number, String],
      default: 14,
    },
    formItemsCover: {
      // 表单项是否铺满容器
      type: Boolean,
      default: true,
    },
    optionControl: {
      // 选项列表字段控制
      type: Object,
      default() {
        return {
          label: "label",
          value: "value",
        };
      },
    },
    // 字典数据字段控制
    dictControl: {
        type: Object,
        default() {
            return {
                label: 'dictLabel',
                value: 'dictValue'
            };
        },
    },
    showValidationFailsMessage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      componentId: getId(true),
      form: {}, // 表单
      rules: {}, // 验证规则
      dicts: this.received_dicts, // 默认接收父组件传递的字典数据 避免重复请求
      formItemList: [], // 表单列表
      defaultFieldsValue: JSON.parse(JSON.stringify(this.initFields)), // 默认字段值
      timer: null, // 定时器
      otherData: {}, // 文件上传-下拉选择器数据
      formLabelLength: 2, // 表单项标签文本长度
      formLabelFillWidth: 12, // 表单项标签补充宽度
      supportedComponents: Object.freeze({
        "date-picker": "", // 时间选择器
        input: "", // 文本输入框
        "input.number": "", // 数字输入框
        switch: false, // 开关
        select: "", // 下拉选择器
        link: "", // 文字链接
        "time-picker": this.getPickerInitTime(), // 时间范围选择器
        "radio-group": "", // 单选框组
        "checkbox-group": [], // 多选框组
        "input-number": 0, // 计数器
        cascader: "", // 级联选择器
        autocomplete: "", // 远程搜索
        "upload-image": [], // 图片上传
        "upload-button": [], // 上传-按钮
        "upload-select": [], // 上传-下拉框
        'select-tree': [], // 选择树
        "button-group": "",
        unknown: "", // 未知的
      }), // 受支持的预设控件
    };
  },
  watch: {
    column() {
      this.collatingDataStructures();
      this.$emit("created", { form: this.form });
    },
    currentPanel() {
      // 切换面板
      if (this.dataIsolation) {
        // 数据隔离 重置表单和验证规则
        this.form = {};
        this.rules = {};
        // 设置新面板
        this.formItemList = this.column.filter((item) => {
          return item.panel === this.currentPanel;
        });
        // 初始化
        this.collatingDataStructures();
        this.$emit("created", { form: this.form });
      }
    },
  },
  computed: {
    /**
     * 返回选项列表字段值配置
     */
    returnOptionsFields(){
      return (item, opt, field) => {
        return item.optionControl
              ? opt[item.optionControl[field]]
              : (item.dict ? opt[this.dictControl[field]] : opt[this.optionControl[field]])
      }        
    },
    /**
     * 获取prop
     */
    getProp(){
        return item => {
            return item.module ? `${item.module}-${item.prop}` : item.prop;
        }
    },
    /**
     * 批量绑定控件事件
     */
    getControlEvents() {
      return (item) => {
        let controlEvents = {};
        if (typeof item.controlEvents === "object") {
          for (let i in item.controlEvents) {
            controlEvents[i] = (params) => {
              typeof item.controlEvents[i] === "function"
                ? item.controlEvents[i]({
                    params,
                    form: this.form,
                    dicts: this.dicts,
                    trigger: item,
                    that: this,
                  })
                : () => {
                    console.log(params);
                  };
            };
          }
          return controlEvents;
        } else {
          return controlEvents;
        }
      };
    },
    getFormItems() {
      if (this.currentPanel && !this.dataIsolation) {
        // 存在面板设置但是没有数据隔离时
        return this.formItemList.filter((item) => {
          return item.panel === this.currentPanel;
        });
      } else {
        return this.formItemList;
      }
    },
    getFormVisible() {
      return (item) => {
        let type = typeof item.formVisible;
        return type === "boolean"
          ? item.formVisible
          : type === "function"
          ? item.formVisible({
              form: this.form,
              panel: this.currentPanel,
              mode: this.currentMode,
            })
          : true;
      };
    },
    getFormLabelWidth() {
      return this.formLabelWidth ? this.formLabelWidth :
        (this.formLabelLength * this.formLabelFontSize +
        this.formLabelFillWidth +
        "px");
    },
    getPreviewSrcList() {
      return (arr) => {
        return arr.map((item) => item.url);
      };
    },
    controlEvent() {
      return (item) => {
        return item.eventName ? item.eventName : "click";
      };
    },
    formItemWidth() {
      // 返回表单项宽度
      return (item) => {
        let cols =
          typeof item.cols === "number" &&
          item.cols > 0 &&
          item.cols <= this.cols
            ? item.cols
            : 1;

        return item.colWidth
          ? typeof item.colWidth === "number"
            ? item.colWidth + "px"
            : item.colWidth
          : this.colsWidth
          ? typeof this.colsWidth === "number"
            ? this.colsWidth + "px"
            : this.colsWidth
          : cols * this.defaultWidth + "%";
      };
    },
    defaultWidth() {
      // 分列宽度
      return parseInt((100 / this.cols) * 100000) / 100000;
    },
    isRender() {
      // 渲染控件
      return (targetType, type) => {
        return targetType === type;
      };
    },
    canEdit() {
      // 控件类型是否支持
      return (type) => {
        return type in this.supportedComponents;
      };
    },
    setDisabled() {
      // 禁用表单项
      return (disabled) => {
        if (this.disabledForm === true) {
          return true;
        }
        let type = typeof disabled;
        return type === "boolean"
          ? disabled
          : type === "function"
          ? disabled({
              form: this.form,
              panel: this.currentPanel,
              mode: this.currentMode,
            })
          : false;
      };
    },
    /**
     * 设置只读
     */
    setReadonly(){
      return readonly => {
        if(this.readOnlyForm === true){
          return true;
        };
        let type = typeof readonly;
        if(type === "boolean"){
          return readonly;
        }else if(type === "function"){
          return readonly({
            form: this.form,
            panel: this.currentPanel,
            mode: this.currentMode,
          })
        }
      }
    },
    /**
     * 返回输入控件的验证触发方式
     */
    returnInputTrigger(){
      return type => {
        // let change = ['select', 'date-picker', 'radio-group', 'switch', 'time-picker', 'checkbox-group', 'cascader']
        if(['input', 'input-number', 'autocomplete'].indexOf(type) > -1){
          return 'blur';
        }else{
          return 'change'
        }
      }
    },
    returnOptions() {
      return (item) => {
        return (
          this.dicts[item.dict] ||
          this.$attrs[item.optionsKey] ||
          item.options ||
          []
        );
      };
    },
    returnControlProperty() {
      function config() {
        return {
          select: {
            filterable: true,
            clearable: true,
            placeholder: "请选择",
          },
          input: {
            type: "input",
            clearable: true,
            "show-password": false,
            "show-word-limit": false,
            maxlength: "",
            "suffix-icon": "", // 后缀icon
            "prefix-icon": "", // 前缀icon
            placeholder: "请输入内容",
          },
          "date-picker": {
            type: "date",
            format: "yyyy-MM-dd", // 当是datetimerange报错 todo
            "value-format": "yyyy-MM-dd",
            editable: false,
            clearable: true,
            readonly: false,
            placeholder: "请选择",
          },
          "time-picker": {
            "is-range": true,
            "range-separator": "至",
            "start-placeholder": "开始时间",
            "end-placeholder": "结束时间",
            placeholder: "选择时间范围",
          },
          switch: {
            "active-text": "",
            "inactive-text": "",
          },
          link: {
            type: "primary",
            icon: "",
            underline: true,
          },
          "radio-group": {},
          "checkbox-group": {},
          "input-number": { size: "mini" },
          cascader: {
            clearable: true,
          },
          autocomplete: {
            clearable: true,
            "value-key": "dictValue",
            "fetch-suggestions": (queryString, cb) => {
              console.log("fetch-suggestions", queryString);
              cb([]);
            },
          },
          "upload-button": {
            action: "",
            "auto-upload": false,
            multiple: true,
            "show-file-list": false, // 不展示上传列表
          },
          "upload-image": {
            action: "",
            "auto-upload": false,
            multiple: true,
          },
          "upload-select": {
            action: "",
            "auto-upload": false,
            multiple: true,
          },
          'select-tree': {

          }
        };
      }
      return (item) => {
        let { editType, control } = item;
        let _config = config()[editType];
        if (control) {
          for (let i in control) {
            _config[i] = control[i];
          }
        }
        // cascader的options和lazy动态加载不能同时存在, 否则将造成选中后不能回显的问题!
        if (editType == "cascader" && !control.prop?.lazy) {
          _config.options = this.returnOptions(item);
        }
        return _config;
      };
    },
  },
  created() {
    if (this.currentPanel && this.dataIsolation) {
      // 存在面板设置与数据隔离时
      this.formItemList = this.column.filter((item) => {
        return item.panel === this.currentPanel;
      });
    } else {
      this.formItemList = this.column;
    }
    this.collatingDataStructures();
    this.$emit("created", { form: this.form });
  },
  methods: {
    // 返回时间范围选择器初始值
    getPickerInitTime() {
      let arr = [new Date(), new Date()];
      arr.forEach((item, index) => {
        item.setHours(index ? 23 : 0);
        item.setMinutes(0);
        item.setSeconds(0);
        item.setMilliseconds(0);
      });
      return arr;
    },
    // 整理数据结构
    collatingDataStructures() {
      let hasRequired = false;
      this.formItemList.forEach((item) => {
        item.editType =
          item.editType in this.supportedComponents ? item.editType : "unknown";
        const prop = item.module ? `${item.module}-${item.prop}` : item.prop; // 分模块
        let defaultValue = this.initFields.hasOwnProperty(prop)
          ? this.initFields[prop]
          : this.supportedComponents[item.editType];
        
        this.$set(this.form, prop, defaultValue); // 初始化表单字段数据
        this.defaultFieldsValue[prop] = JSON.parse(JSON.stringify(defaultValue)); // 初始化字段默认值
        // 检查最长标签长度
        this.formLabelLength =
          item.label?.length > this.formLabelLength
            ? item.label.length
            : this.formLabelLength;
        if (!hasRequired && item.required) {
          // 存在必传项时要加10px的宽度
          this.formLabelFillWidth = this.formLabelFillWidth + 10;
          hasRequired = true;
        }

        //// 获取字典
        if (item.dict && !(item.dict in this.dicts)) {
          this.getDicts(item.dict).then(response => {
              let {code, context} = response;
              if(code === "K-000000" && context){
                  this.$set(this.dicts, item.dict, context)
                  if(typeof item.selectedIndex === 'number'){
                    // 默认选中项
                    this.form[prop] = context[item.selectedIndex][this.dictControl.value];
                  }
              }
              // console.log('字典数据', this.dicts)
          });
        }

        // 校验
        let validator = item.formValidator || item.validator;
        if (Array.isArray(validator)) {
          this.rules[item.prop] = validator; // 数组 直接赋值
          return;
        }
        let validate = {
          required: item.required === true ? true : false,
          trigger: item.validateTrigger ? item.validateTrigger : this.returnInputTrigger(item.editType),
        }; // 验证

        if (validator) {
          // 自定义验证
          let func = null;
          if (Object.prototype.toString.call(validator) === "[object RegExp]") {
            // 正则
            func = (rule, value, callback) => {
              if (this.notEmpty(value)) {
                if (validator.test(value)) {
                  callback();
                } else {
                  callback(
                    new Error(
                      item.validateTips
                        ? item.validateTips
                        : "校验失败, 请检查后重新输入"
                    )
                  );
                }
              } else if (item.required) {
                callback(
                  new Error(
                    item.validateTips
                      ? item.validateTips
                      : `请输入${item.label}`
                  )
                );
              }
              callback();
            };
          } else if (typeof validator === "function") {
            func = (rule, value, callback) => {
              validator(this.form, callback);
            };
          }
          validate.validator = func;
        } else {
          validate.message = item.validateTips
            ? item.validateTips
            : `${item.formLabel || item.label}不能为空`;
        }
        this.rules[prop] = [validate];
      });
    },
    // 表单图片选择器
    // beforeAvatarUpload(file, prop) {
    //   const isLt2M = file.size / 1024 / 1024 < 2
    //   if (!isLt2M) {
    //     this.$message.error('上传图片大小不能超过 2MB!')
    //     return false
    //   }
    //   this.form.file = file // 保存文件
    //   // 读取文件 本地预览
    //   let that = this
    //   let reads = new FileReader()
    //   reads.readAsDataURL(file)
    //   reads.onload = function (e) {
    //     console.log(e)
    //     that.form[prop] = this.result
    //   }
    //   return false
    // },

    // 控制方法
    controlMethod($event, item) {
      if (typeof item.controlMethod === 'function') {
        item.controlMethod({ params: $event, form: this.form, item, that: this })
      } else if(item.emit){
        this.$emit('change', {type: item.emit, params: $event, form: this.form, trigger: item, that: this })
      }
    },
    // 表单 自定义按钮触发事件
    customButtonEvents(item) {
      if(item.target === 'reset'){
        this.resetFields();
      }
      if(item.emit){
          this.$emit('change', {type: item.emit, form: this.form, dicts: this.dicts, mode: this.currentMode, panel: this.currentPanel})
      }
      
    },
    // 校验并获取表单数据
    validate(func) {
      let validResult = false;
      this.$refs["dynamic-form"].validate((valid) => {
        if (valid) {
          validResult = true;
        } else if(this.showValidationFailsMessage){
          this.$message({
            type: "error",
            message: "表单验证失败, 请检查完善后再试!",
          });
        }
        if (typeof func === "function") {
          func({valid, form: valid ? this.deepClone(Object.assign(this.initFields, this.form)) : null, module: valid ? this.getFormModule() : null});
        }
      });
      return validResult;
    },
    /**
     * 获取模块划分后的表单
     */
    getFormModule(name){
        let module = {};
        let copyForm = this.deepClone(this.form);
        if(name){
            // 获取指定模块
            this.formItemList.forEach(item => {
                if(item.module === name){
                    let prop = `${item.module}-${item.prop}`;
                    if(item.module in module){
                        module[item.module][item.prop] = copyForm[prop];
                    }else{
                        let obj = {};
                        obj[item.prop] = copyForm[prop];
                        module[item.module] = obj;
                    }
                }
            })
        }else{
            // 全部模块和未划分模块
            this.formItemList.forEach(item => {
                let prop = item.prop;
                if(item.module){
                    prop = `${item.module}-${item.prop}`;
                    // 存在模块划分
                    if(item.module in module){
                        module[item.module][item.prop] = copyForm[prop];
                    }else{
                        let obj = {};
                        obj[item.prop] = copyForm[prop];
                        module[item.module] = obj;
                    }
                }else{
                    module[item.prop] = copyForm[prop];
                }
            })
        }
        return module;
    },
    /**
     * 提交表单验证
     */
    submitFormValidation(item, trigger){
      this.$refs['dynamic-form'].validateField(item.prop);
    },
    /**
     * 更新表单数据
     */
    updateFields(target) {
      for (let i in target) {
        this.$set(this.form, i, target[i]);
      }
      console.log(this.form, 'this.form')
    },
    // 重置表单数据
    resetFields(manualReset) {
      this.otherData = {}; // 重置其他备用数据
      if (manualReset) {
        for (let i in this.form) {
          this.form[i] = this.defaultFieldsValue[i];
        }
      }
      this.$refs["dynamic-form"].resetFields();
    },
    // 清理校验信息
    clearValidate(){
      this.$refs["dynamic-form"].clearValidate();
    },
    fileSelectChange(arr, item) {
      // 设置待上传列表
      this.form[item.prop] = this.otherData[item.prop + "-list"].filter(
        (item) => {
          return arr.indexOf(item.uid) > -1;
        }
      );
    },
    fileSelectUpload(file, fileList, item) {
      // 文件select 上传
      if (file.status === "ready") {
        // 辅助数据 列表/选中项
        this.otherData[item.prop + "-list"] = fileList; // 设置可选文件列表
        this.otherData[item.prop + "-selected"].push(file.uid); // 设置选中
        this.form[item.prop].push(file);
      }
    },
    /**
     * 更新上传图片
     */
    setUploadImage(fileList, item){
      this.form[item.prop] = fileList;
      this.submitFormValidation(item, 'change')
    },
    // 文件超出限制数量
    exceedQuantityLimit(file, fileList, item) {
      this.$message.error(
        `${item.label}的上传文件数量不能超过${item.control.limit}个！`
      );
    },
    submitUpload(prop) {
      // 手动上传
      if (prop) {
        this.$refs[prop][0].submit();
      }
    },
    handleUploadError(err, file, fileList, item) {
      // 上传失败
      console.log(file, fileList, item);
    },
    /**
     * 获取字典数据
     */
    // getDictByProp(prop){
    //     if(prop){
    //       return this.dicts[prop];
    //     }else{
    //       this.$message.info("请传入使用字典数据对应列的prop")
    //     }
    // },
    /**
     * 深拷贝
     */
    deepClone(target, map = new Map()){
        if(target instanceof Date){
            // 时间类型直接返回
            return target;
        }
        if(target instanceof File){
            // 文件类型直接返回
            return target;
        }
        if(target === null){
            return target;
        }
        // 基本数据类型直接返回
        if(typeof target !== 'object'){
            return target;
        }
        // 引用数据类型 数组/对象
        const temp = Array.isArray(target) ? [] : {};
        if(map.get(target)){
            // 已存在则直接返回
            return map.get(target)
        }
        map.set(target, temp)
        for(const key in target){
            temp[key] = this.deepClone(target[key], map)
        }
        return temp;
    },
    /**
     * 判断不为空
     */
    notEmpty(value){
      return [null,undefined,''].indexOf(value) < 0
    }
  },
};
</script>


<style lang="scss" scoped>
.dynamic-form {
  min-width: 370px;
  display: flex;
  flex-wrap: wrap;
  ::v-deep .el-form-item {
    display: flex;
    margin-right: 0px;
    box-sizing: border-box;
    .el-form-item__content {
      margin-left: 0px !important;
    }
    .is-disabled {
      background-color: #fff;
      cursor: default;
      .el-input__inner,
      input {
        cursor: default;
        background-color: #fff;
      }
      .el-textarea__inner {
        cursor: default;
        background-color: #fff;
      }
      .el-switch__core {
        cursor: default;
      }
      .el-checkbox__inner {
        cursor: default;
      }
      .el-checkbox__label {
        cursor: default;
      }
    }
  }
}
.form-items-cover {
  ::v-deep.el-form-item__content {
    flex: 1;
  }
}

// 标签 label-position: center
.el-form--label-center {
  ::v-deep .el-form-item__label {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

// 标签 label-position: top
.el-form--label-top{
  ::v-deep .el-form-item {
    display: block;
  }
}

</style>
