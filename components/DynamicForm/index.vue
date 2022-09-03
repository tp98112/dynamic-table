<template>
  <el-form
    :model="form"
    :rules="rules"
    :disabled="disabledForm"
    ref="dynamic-form"
    :label-width="getFormLabelWidth"
    :label-position="labelPosition"
    :style="{marginLeft: -gutter / 2 + 'px'}"
    :class="{'dynamic-form': true, 'form-items-cover': formItemsCover, 'form-label-flex': labelPosition === 'center'}"
  >
    <template v-for="(item, index) in getFormItems">
        <el-form-item
            :style="{ width: formItemWidth(item), paddingLeft: gutter / 2 + 'px', paddingRight: gutter / 2 + 'px' }"
            :key="index"
            :prop="item.prop"
            :label="item.label ? item.label : ''"
            v-if="getFormVisible(item)"
        >
            <slot
            :name="'form-' + item.prop"
            v-bind="{ form, mode: '' }"
            >
            <renderColumn
                v-if="typeof item.render === 'function'"
                :renderContent="item.render"
                :data="{ form, mode: '' }"
            ></renderColumn>
            <template v-else>
                <!-- 文本输入框 -->
                <el-input
                v-if="isRender(item.editType, 'input')"
                v-model="form[item.prop]"
                v-on:[controlEvent(item)]="controlMethod($event, item)"
                v-on="getControlEvents(item)"
                :size="size"
                v-bind="returnControlProperty(item)"
                :disabled="disabled(item.disabled)"
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
                    <span v-if="item.appendText">{{item.appendText}}</span>
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
                :disabled="disabled(item.disabled)"
                style="width: 100%"
                >
                <el-option
                    v-for="opt in returnOptions(item)"
                    :key="
                    item.optionControl ? opt[item.optionControl.value] : opt.value
                    "
                    :label="
                    item.optionControl ? opt[item.optionControl.label] : opt.label
                    "
                    :value="
                    item.optionControl ? opt[item.optionControl.value] : opt.value
                    "
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
                :disabled="disabled(item.disabled)"
                style="width: 100%"
                ></el-date-picker>
                <!-- 单选框 -->
                <template v-else-if="isRender(item.editType, 'radio')">
                <el-radio
                    v-for="(radio, radioIndex) of returnOptions(item)"
                    v-model="form[item.prop]"
                    v-on:[controlEvent(item)]="controlMethod($event, item)"
                    v-on="getControlEvents(item)"
                    :size="size"
                    v-bind="returnControlProperty(item)"
                    :key="radioIndex"
                    :label="
                    item.optionControl
                        ? radio[item.optionControl.value]
                        : radio.value
                    "
                    :disabled="disabled(item.disabled)"
                > {{
                    item.optionControl
                        ? radio[item.optionControl.label]
                        : radio.label
                    }} </el-radio>
                </template>
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
                    :label="
                    item.optionControl
                        ? opt[item.optionControl.value]
                        : opt.value
                    "
                > {{
                    item.optionControl
                        ? opt[item.optionControl.label]
                        : opt.label
                    }} </el-radio>
                </el-radio-group>
                <!-- switch开关 -->
                <el-switch
                v-else-if="isRender(item.editType, 'switch')"
                v-model="form[item.prop]"
                v-on:[controlEvent(item)]="controlMethod($event, item)"
                v-on="getControlEvents(item)"
                :size="size"
                v-bind="returnControlProperty(item)"
                :disabled="disabled(item.disabled)"
                ></el-switch>
                <!-- 链接 -->
                <el-link
                v-else-if="isRender(item.editType, 'link')"
                :size="size"
                v-bind="returnControlProperty(item)"
                :disabled="disabled(item.disabled)"
                v-on:[controlEvent(item)]="controlMethod($event, item)"
                v-on="getControlEvents(item)"
                >{{ item.linkText ? item.linkText : "默认链接" }} </el-link>
                <!-- 时间范围选择器 -->
                <template v-else-if="isRender(item.editType, 'time-picker')">
                    <el-time-picker
                        v-model="form[item.prop]"
                        v-on:[controlEvent(item)]="controlMethod($event, item)"
                        v-on="getControlEvents(item)"
                        :size="size"
                        v-bind="returnControlProperty(item)"
                        :disabled="disabled(item.disabled)"
                        style="width: 100%">
                    </el-time-picker>
                </template>
                <!-- 多选框 -->
                <template v-else-if="isRender(item.editType, 'checkbox')">
                <el-checkbox
                    v-model="form[item.prop]"
                    v-on:[controlEvent(item)]="controlMethod($event, item)"
                    v-on="getControlEvents(item)"
                    :size="size"
                    v-bind="returnControlProperty(item)"
                    :disabled="disabled(item.disabled)"
                >{{item.checkboxLabel}}</el-checkbox>
                </template>
                <!-- 多选框组 -->
                <template v-else-if="isRender(item.editType, 'checkbox-group')">
                <el-checkbox-group
                    v-model="form[item.prop]"
                    v-on:[controlEvent(item)]="controlMethod($event, item)"
                    v-on="getControlEvents(item)"
                    :size="size"
                    v-bind="returnControlProperty(item)"
                    :disabled="disabled(item.disabled)"
                >
                    <el-checkbox
                    v-for="(opt, optIndex) of returnOptions(item)"
                    :key="optIndex"
                    :label="
                    item.optionControl
                        ? opt[item.optionControl.value]
                        : opt.value
                    "
                    > {{
                    item.optionControl
                        ? opt[item.optionControl.label]
                        : opt.label
                    }} </el-checkbox>
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
                :disabled="disabled(item.disabled)"
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
                :disabled="disabled(item.disabled)"
                ></el-cascader>
                <!-- 远程搜索 -->
                <el-autocomplete
                    v-else-if="isRender(item.editType, 'autocomplete')"
                    v-model="form[item.prop]"
                    :size="size"
                    v-bind="returnControlProperty(item)"
                    v-on:[controlEvent(item)]="controlMethod($event, item)"
                    v-on="getControlEvents(item)"
                    :disabled="disabled(item.disabled)"
                    style="width: 100%;"
                ></el-autocomplete>
                <!-- 上传按钮 -->
                <el-upload
                    v-else-if="isRender(item.editType, 'upload-button')"
                    v-bind="returnControlProperty(item)"
                    :file-list="form[item.prop]"
                    :on-change="(file,fileList) => {return handleUploadChange(file, fileList, item)}"
                    :on-remove="(file,fileList) => {handleUploadRemove(file,fileList, item)}"
                    >
                    <el-badge :value="form[item.prop].length" :hidden="form[item.prop].length === 0" class="item" type="primary">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-badge>
                </el-upload>
                <!-- 图片上传 -->
                <template v-else-if="isRender(item.editType, 'upload-img')">
                    <el-upload
                      v-bind="returnControlProperty(item)"
                      :ref="item.prop"
                      :show-file-list="true"
                      :file-list="form[item.prop]"
                      :id="'upload-' + item.prop"
                      list-type="picture-card"
                      style="height: 148px"
                      :on-change="(file,fileList) => {return handleUploadChange(file, fileList, item)}"
                      :on-error="(err, file,fileList) => {handleUploadError(err, file,fileList, item)}"
                      >
                      <i class="el-icon-plus"></i>
                      <div slot="file" slot-scope="{file}">
                        <el-image 
                          class="el-upload-list__item-thumbnail"
                          :id="'img_'+file.uid"
                          :src="file.url" 
                          :preview-src-list="getPreviewSrcList(form[item.prop])">
                        </el-image>
                        <span class="el-upload-list__item-actions">
                          <span
                            class="el-upload-list__item-preview"
                            @click="handlePictureCardPreview(file)"
                          >
                            <i class="el-icon-zoom-in"></i>
                          </span>
                          <span
                            v-if="false"
                            class="el-upload-list__item-delete"
                            @click="handleDownload(file)"
                          >
                            <i class="el-icon-download"></i>
                          </span>
                          <span
                            class="el-upload-list__item-delete"
                            @click="removeUploadImg(file, item)"
                          >
                            <i class="el-icon-delete"></i>
                          </span>
                        </span>
                      </div>
                    </el-upload>
                </template>
                <!-- 上传下拉选择器 -->
                <div v-else-if="isRender(item.editType, 'upload-select')" style="display:flex; align-items: center">
                    <el-select v-model="otherData[item.prop + '-selected']" @change="fileSelectChange($event, item)" multiple :size="size" style="width: 100%;margin-right: 5px">
                        <el-option
                        v-for="item in otherData[item.prop + '-list']"
                        :key="item.uid"
                        :label="item.name"
                        :value="item.uid">
                        </el-option>
                    </el-select>
                    <el-upload
                        v-bind="returnControlProperty(item)"
                        :file-list="form[item.prop]"
                        :show-file-list="false"
                        :on-change="(file,fileList) => {return fileSelectUpload(file, fileList, item)}"
                        style="line-height: initial;"
                    >
                        <el-badge :value="form[item.prop].length" :hidden="form[item.prop].length === 0" class="item" type="primary">
                            <el-button :size="size" type="primary">点击上传</el-button>
                        </el-badge>
                    </el-upload>
                </div>
                <div v-else-if="isRender(item.editType, 'button-group')">
                    <el-button
                        v-for="(opt, index) of item.options"
                        :key="index"
                        @click="customEventEmit(opt)"
                        :type="opt.type"
                        :icon="opt.icon"
                        :title="opt.title"
                        :plain="opt.plain"
                        :round="opt.round"
                        :circle="opt.circle"
                        :disabled="disabled(opt.disabled)"
                        :size="opt.size">{{opt.label}}</el-button>
                </div>
                <span
                v-else
                class="unknown-span"
                >{{form[item.prop]}}</span>
            </template>
            </slot>
        </el-form-item>
</template>
  </el-form>
</template>

<script>
const renderColumn = {
  props: {
    data: Object,
    renderContent: Function
  },
  render(h) {
    return this.renderContent(h, this.data)
  }
}
export default {
  /**
   * 动态表单
   */
  name: 'dynamicForm',
  inheritAttrs: false, // 未声明接收的prop不显示在dom上
  components: { renderColumn },
  props: {
    column: {
      type: Array,
      default() {
        return []
      }
    },
    cols: {
      // 将一行分成cols份
      type: [Number, String],
      default: 1
    },
    colsWidth: {
        // 设置为 'auto' 并且 formItemsCover 为false时即是elementUi表单的原始排版效果
        type: String,
    },
    size: {
        // 表单控件尺寸
        type: String,
        default: 'small'
    },
    gutter: {
        type: Number,
        default: 20
    },
    currentMode: {
        // 当前操作模式
        type: [String, Number],
    },
    disabledForm: {
        // 表单禁用
        type: Boolean,
        default: false
    },
    currentPanel: {
        // 当前面板
        type: [String, Number]
    },
    dataIsolation: {
        // 当存在不同面板时 是否启用数据隔离
        type: Boolean,
        default: false
    },
    initFields: {
      // 初始化字段 可在此设置字段默认值
      type: Object,
      default(){
        return {}
      }
    },
    labelPosition: {
        // 表单标签对齐方式
        type: String,
        default: 'center'
    },
    formLabelWidth: {
      // 表单标签宽度
      type: [Number, String],
      default: '80px'
    },
    formLabelFontSize: {
        // 表单标签字体大小 用以自动计算表单标签宽度,
        // 如若通过css修改了字体大小 ,请传递该值告知或在此处修改默认值
        type: [Number, String],
        default: 14
    },
    formLabelFillWidth: {
        // 表单标签补充宽度
        // 表单标签宽度由标签文字长度和其他边距共同决定
        // 项目环境不同可能导致的宽度不一致, 设置该值以补全宽度
        type: Number,
        default: 12
    },
    formItemsCover: {
      // 表单项是否铺满容器
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      form: {}, // 表单
      rules: {}, // 验证规则
      dicts: {},
      formItemList: [], // 表单列表
      defaultFieldsValue: {},
      otherData: {}, // 文件上传-下拉选择器数据
      formLabelLength: 2, // 表单项标签文本长度
      supportedComponents: Object.freeze({
        'date-picker': '', // 时间选择器
        input: '', // 文本输入框
        'input.number': '', // 数字输入框
        switch: false, // 开关
        select: '', // 下拉选择器
        link: '', // 文字链接
        'time-picker': this.getPickerInitTime(), // 时间范围选择器
        radio: '', // 单选框
        'radio-group': '', // 单选框组
        checkbox: '', // 多选框
        'checkbox-group': [], // 多选框组
        'input-number': 0, // 计数器
        cascader: '', // 级联选择器
        autocomplete: '', // 远程搜索
        'upload-img': [], // 图片上传
        'upload-button': [], // 上传-按钮
        'upload-select': [], // 上传-下拉框
        'button-group': '',
        unknown: '' // 未知的
      }), // 受支持的预设控件
    }
  },
  watch: {
    column(){
        this.collatingDataStructures()
    },
    currentPanel(){
        // 切换面板
        if(this.dataIsolation){
            // 数据隔离 重置表单和验证规则
            this.form = {}; 
            this.rules = {};
            // 设置新面板
            this.formItemList = this.column.filter(item => {
                return item.panel === this.currentPanel;
            })
            // 初始化
            this.collatingDataStructures()
        };
    }
  },
  computed: {
    /**
     * 批量绑定控件事件
     */
    getControlEvents(){
        return item => {
            let controlEvents = {};
            if(typeof item.controlEvents === 'object'){
                for(let i in item.controlEvents){
                    controlEvents[i] = params => {
                        typeof item.controlEvents[i] === 'function' ? item.controlEvents[i]({ params, form: this.form, item, that: this }) : () => {console.log(params)}
                    }
                };
                return controlEvents;
            }else{
                return controlEvents;
            }
        }
    },
    getFormItems(){
        if(this.currentPanel && !this.dataIsolation){
            // 存在面板设置但是没有数据隔离时
            return this.formItemList.filter(item => {
                return item.panel === this.currentPanel;
            })
        }else{
            return this.formItemList;
        }
    },
    getFormVisible(){
        return item => {
            let type = typeof item.formVisible;
            return type === 'boolean' ? item.formVisible : (type === 'function' ? item.formVisible({form: this.form, panel: this.currentPanel, mode: this.currentMode}) : true);
        }
    },
    getFormLabelWidth(){
        return this.formLabelLength * this.formLabelFontSize + this.formLabelFillWidth + 'px';
    },
    getPreviewSrcList(){
      return arr => {
        return arr.map(item => item.url)
      }
    },
    controlEvent() {
        return item => {
            return item.eventName ? item.eventName : 'click';
        }
    },
    formItemWidth() {
      // 返回表单项宽度
      return item => {
        let cols = typeof item.cols === 'number' && item.cols > 0 && item.cols <= this.cols ?  item.cols : 1;
        
        return item.colWidth ? (typeof item.colWidth === 'number' ? item.colWidth + 'px' : item.colWidth) :  
        this.colsWidth ? (typeof this.colsWidth === 'number' ? this.colsWidth + 'px' : this.colsWidth) : (cols * this.defaultWidth + '%');
      }
    },
    defaultWidth() {
        // 分列宽度
        return parseInt((100 / this.cols) * 100000) / 100000;
    },
    isRender() {
      // 渲染控件
      return (targetType, type) => {
        return targetType === type
      }
    },
    canEdit() {
      // 控件类型是否支持
      return type => {
        return type in this.supportedComponents
      }
    },
    disabled() {
      // 禁用表单项
      return disabled => {
        if(this.disabledForm === true){
            return true;
        }
        let type = typeof disabled
        return type === 'boolean' ? disabled : type === 'function' ? disabled({ form: this.form, panel: this.currentPanel, mode: this.currentMode }) : false
      }
    },
    returnOptions() {
      return item => {
        return this.dicts[item.dict] || this.$attrs[item.optionsKey] || item.options || []
      }
    },
    returnControlProperty() {
      function config() {
        return {
          select: {
            filterable: true,
            clearable: true,
            placeholder: '请选择'
          },
          input: {
            type: 'input',
            clearable: true,
            'show-password': false,
            'show-word-limit': false,
            maxlength: '',
            'suffix-icon': '', // 后缀icon
            'prefix-icon': '', // 前缀icon
            placeholder: '请输入内容'
          },
          'date-picker': {
            type: 'date',
            format: 'yyyy-MM-dd',
            'value-format': 'yyyy-MM-dd',
            editable: false,
            clearable: true,
            readonly: false,
            placeholder: '请选择'
          },
          'time-picker': {
            'is-range': true,
            'range-separator': '至',
            'start-placeholder': '开始时间',
            'end-placeholder': "结束时间",
            placeholder:"选择时间范围"
          },
          switch: {
            'active-text': '',
            'inactive-text': ''
          },
          link: {
            type: 'primary',
            icon: '',
            underline: true
          },
          radio: {},
          'radio-group': {},
          checkbox: {},
          'checkbox-group': {},
          'input-number': { size: 'mini' },
          cascader: {
            clearable: true,
          },
          autocomplete: {
            clearable: true,
            'value-key': 'dictValue',
            'fetch-suggestions': (queryString, cb) => {
              console.log('fetch-suggestions', queryString)
              cb([]);
            }
          },
          'upload-button': {
            action: "",
            'auto-upload': false,
            multiple: true,
            'show-file-list': false, // 不展示上传列表
          },
          'upload-img': {
            action: "",
            'auto-upload': false,
            multiple: true,
          },
          'upload-select': {
            action: '',
            'auto-upload': false,
            multiple: true,
          }
        }
      }
      return (item) => {
        let {editType, control} = item;
        let _config = config()[editType]
        if (control) {
          for (let i in control) {
            _config[i] = control[i]
          }
        }
        // cascader的options和lazy动态加载不能同时存在, 否则将造成选中后不能回显的问题!
        if(editType == 'cascader' && !control.prop?.lazy ){
          _config.options = this.returnOptions(item)
        }
        return _config
      }
    }
  },
  created() {
    if(this.currentPanel && this.dataIsolation){
        // 存在面板设置与数据隔离时
        this.formItemList = this.column.filter(item => {
            return item.panel === this.currentPanel;
        })
    }else{
        this.formItemList = this.column;
    }
    this.collatingDataStructures()
  },
  methods: {
    // 返回时间范围选择器初始值
    getPickerInitTime(){
        let arr = [new Date(), new Date()];
        arr.forEach((item, index) => {
            item.setHours(index ? 23 : 0);
            item.setMinutes(0);
            item.setSeconds(0)
            item.setMilliseconds(0)
        })
        return arr
    },
    // 整理数据结构
    collatingDataStructures() {
      this.formItemList.forEach(item => {
        item.editType = item.editType in this.supportedComponents ? item.editType : 'unknown'
        let defaultValue = this.initFields.hasOwnProperty(item.prop) ? this.initFields[item.prop] : this.supportedComponents[item.editType];
        this.$set(this.form, item.prop, defaultValue) // 初始化表单字段数据
        this.defaultFieldsValue[item.prop] = defaultValue; // 初始化字段默认值
        // 检查最长标签长度
        this.formLabelLength = item.label?.length > this.formLabelLength ? item.label.length : this.formLabelLength;
        
        //// 获取字典
        if (item.dict && !(item.dict in this.dicts)) {
        //   getCommonApi({ code: item.dict }).then(response => {
        //     let { code, data } = response.data
        //     if (code === 200 && data) {
        //       this.$set(this.dicts, item.dict, data)
        //     }
        //   })
        };

        // 加载时主动触发控件事件
        if(item.loadTrigger && item.eventName && item.controlMethod){
          this.controlMethod(this.form[item.prop], item)
        }

        if (Array.isArray(item.validator)) {
          this.rules[item.prop] = item.validator // 数组 直接赋值
          return
        }
        let validate = { required: item.required === true ? true : false, trigger: item.validateTrigger ? item.validateTrigger : 'blur' } // 验证
        if (item.validator) {
          // 自定义验证
          let func = null
          if (Object.prototype.toString.call(item.validator) === '[object RegExp]') {
            // 正则
            func = (rule, value, callback) => {
              if (value) {
                let reg = item.validator
                if (reg.test(value)) {
                  callback()
                } else {
                  callback(new Error(item.validationTips ? item.validationTips : '校验失败, 请检查后重新输入'))
                }
              } else if (item.required) {
                callback(new Error(item.validationTips ? item.validationTips : `请输入${item.label}`))
              }
              callback()
            }
          } else if (typeof item.validator === 'function') {
            func = (rule, value, callback) => {
              item.validator(this.form, callback)
            }
          }
          validate.validator = func
        } else {
          validate.message = item.validationTips ? item.validationTips : `${item.label}不能为空`
          if (item.editType === 'fixed-time-select') {
            delete validate.message
            validate.validator = (rule, value, callback) => {
              if (value.startTime === null || value.endTime === null || value.startTime === '' || value.endTime === '') {
                callback(new Error('校验失败, 请完善时段设置'))
              } else {
                callback()
              }
            }
          }
        }
        this.rules[item.prop] = [validate]
      })
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
      } else {
        this.$emit('change', { params: $event, form: this.form, item, that: this })
      }
    },
    // 表单 自定义按钮触发事件
    customEventEmit(item) {
      this.$emit(item.emit, this.form)
    },
    // 校验并获取表单数据
    validate(func) {
      this.$refs['dynamic-form'].validate(valid => {
        if (valid) {
          // console.log('');
        } else {
          this.$message({
            type: 'error',
            message: '表单验证失败, 请检查完善后再试!'
          })
        }
        if (typeof func === 'function') {
          func(valid, valid ? this.form : null)
        }
      })
    },
    // 回显数据
    setFormValue(data){
        for(let i in this.form){
            this.form[i] = data[i];
        }
    },
    // 重置表单数据
    resetForm(manualReset){
      this.$refs['dynamic-form'].resetFields();
      this.otherData = {}; // 重置其他备用数据
      if(manualReset){
        for(let i in this.form){
          this.form[i] = this.defaultFieldsValue[i];
        }
      }
    },
    fileSelectChange(arr, item){
        // 设置待上传列表
        this.form[item.prop] = this.otherData[item.prop + '-list'].filter(item => {
            return arr.indexOf(item.uid) > -1;
        })
    },
    fileSelectUpload(file, fileList, item){
        // 文件select 上传
        if(file.status === "ready"){
            // 辅助数据 列表/选中项
            this.otherData[item.prop + '-list'] = fileList; // 设置可选文件列表
            this.otherData[item.prop + '-selected'].push(file.uid) // 设置选中
            this.form[item.prop].push(file)
        }
    },
    handleUploadChange(file, fileList, item){
        // console.log(file, fileList, item)
        if(file.status === "ready"){
            this.form[item.prop] = fileList;
            // 只能上传一个文件时隐藏上传区域
            if(item.control?.limit == 1){
                let p = document.getElementById(`upload-${item.prop}`)
                p.getElementsByClassName('el-upload')[0].style.display = 'none';
            }
        }
    },
    handleUploadRemove(file, fileList, item){
        if(file.status === "ready"){
            this.form[item.prop] = fileList;
        }
    },
    removeUploadImg(file, column){
        // 移除上传图片
        this.form[column.prop].some((item, index) => {
            if(item.uid === file.uid){
                this.form[column.prop].splice(index, 1)
                if(column.control?.limit == 1){
                    setTimeout(() => {
                        // 图片移除时有约一秒钟的动画 避免容器被撑大
                        let p = document.getElementById(`upload-${column.prop}`)
                        p.getElementsByClassName('el-upload')[0].style.display = 'block';
                    }, 1000)
                }
                return true;
            }
        })
    },
    handlePictureCardPreview(file) {
        // 大图预览
       document.getElementById('img_' + file.uid).click()
    },
    handleDownload(file){
        // 下载文件
    },
    submitUpload(prop){
      // 手动上传
      if(prop){
        this.$refs[prop][0].submit()
      }
    },
    handleUploadError(err, file, fileList, item){
      // 上传失败
      console.log(file, fileList, item)
    },
  }
}
</script>


<style lang="scss" scoped>
.dynamic-form {
    min-width: 370px;
    display: flex;
    flex-wrap: wrap;
    ::v-deep.el-form-item{
        margin-right: 0px;
        display: flex;
        box-sizing: border-box;
        .el-form-item__content{
            white-space: nowrap;
            margin-left: 0px !important;
        }
        .is-disabled{
            background-color: #fff;
            cursor: default;
            .el-input__inner, input{
                cursor: default;
                background-color: #fff;
            }
            .el-switch__core{
                cursor: default;
            }
            .el-checkbox__inner{
                cursor: default;
            }
            .el-checkbox__label{
                cursor: default;
            }
            
        }
    }
  .separator {
    display: inline-block;
    width: 30px;
    text-align: center;
  }
  // 图片选择器
  ::v-deep.avatar-uploader {
    display: flex;
    align-items: center;
    width: 5.859vw;
    height: 5.859vw;
    .el-upload {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      // overflow: hidden;
      .img-wrap {
        i {
          position: absolute;
          top: -5px;
          right: -5px;
          color: #909399;
          &:hover {
            color: #f56c6c;
          }
        }
        .avatar {
          width: 5.208vw;
          height: 5.208vw;
          border-radius: 6px;
          display: block;
        }
      }
      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 5.208vw;
        height: 5.208vw;
        line-height: 5.208vw;
        text-align: center;
      }
    }
    .el-upload:hover {
      border-color: #409eff;
    }
  }
}
.form-items-cover{
  ::v-deep.el-form-item__content{
        flex:1;
    }
}
.form-label-flex{
    ::v-deep.el-form-item__label{
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
