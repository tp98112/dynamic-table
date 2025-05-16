

<script>
import { deepClone, deepMerge, debounce, getCurrentCols } from '../../tools';
import { getId, getFieldType } from "../../tools.js";
import config from "./config.js";
const customRender = {
  props: {
    data: Object,
    renderContent: Function,
  },
  render(h) {
    return this.renderContent(h, this.data);
  },
};


const Cols = {
  props: {
    cols: {
      type: [Number, Object],
      default: 1
    },
    breakpoint: {
      type: Object
    }
  },
  data(){
    return {
      internalCols: typeof this.cols === 'number' ? this.cols : (typeof this.cols?.span === 'number' ? this.cols.span : 1)
    }
  },
  computed: {
    averageWidth(){
      return parseInt((100 / this.internalCols) * 100000) / 100000;
    },
  },
  created(){
    getFieldType(this.cols) === 'Object' && this.setInternalCols() && window.addEventListener('resize', this.debounceSetInternalCols);
    // setTimeout(() => {
    //   window.removeEventListener("resize", debounce(this.setInternalCols, 100))
    // }, 3000)
  },
  destroyed(){
    window.removeEventListener("resize", this.setInternalCols)
  },
  methods: {
    debounceSetInternalCols(){
      debounce(this.setInternalCols, 100)
    },
    setInternalCols(){
      this.internalCols = getCurrentCols(this.breakpoint, this.cols);
      return true;
    }
  },
  render(h) {
    return this.$scopedSlots.default({cols: this.internalCols, averageWidth: this.averageWidth});
  },
};

export default {
  /**
   * 动态表单
   */
  name: "TpDynamicForm",
  inheritAttrs: false,
  components: {
    customRender,
    Cols,
    TuploadButton: () => import('../Tupload/Button.vue'),
    TuploadImages: () => import('../Tupload/new.vue'),
    Ttable: () => import('../../index.vue')
  },
  props: {
    column: {
      type: Array,
      default() {
        return [];
      },
    },
    search: {
      // 作为表格的搜索栏使用
      type: Boolean,
      default: false
    },
    isTableComponent: {
      // 标记当前表单是否是表格(Ttable)的子组件
      type: Boolean,
      default: false
    },
    cols: {
      // 将一行分成cols份
      type: [Number, String, Object],
      default: 1,
    },
    grid: {
      type: Boolean,
      default: false,
    },
    colsWidth: {
      // 设置为 'auto' 并且 formItemsCover 为false时即是elementUi表单的原始排版效果
      type: String,
    },
    colProps: {
      type: Object,
    },
    breakPoint: {
      type: Object,
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
    eventType: {
      // 事件类型
      type: [String, Number],
    },
    currentMode: {
      // 当前操作模式 new/update/view
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
    splitPanelData: {
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
    getDicts: {
      // 获取字典数据方法
      type: Function,
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
      default: "right",
    },
    formLabelWidth: {
      // 表单标签宽度 px
      type: [Number, String],
    },
    formItemsCover: {
      // 表单项是否铺满容器
      type: Boolean,
      default: true,
    },
    optionFieldNames: {
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
    dictFieldNames: {
        type: Object,
    },
    showValidationFailsMessage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      componentId: getId(true),
      form: this.deepClone(this.initFields), // 表单
      rules: {}, // 验证规则
      internalCols: typeof this.cols === 'number' ? this.cols : 1,
      internalCurrentMode: '', // 保存时触发的事件类型 new/update
      backupPanelData: {},
      dicts: this.received_dicts, // 默认接收父组件传递的字典数据 避免重复请求
      formItemList: [], // 表单列表
      defaultFieldsValue: deepClone(this.initFields), // 默认字段值
      internalFormLabelWidth: 'auto', // formLabel标签宽度
      otherData: {}, // 文件上传-下拉选择器数据
      uploadTasks: 0, // 标记上传任务总数
      hasFormList: false, // 标记是否存在form-list
      supportedComponents: Object.freeze({
        "date-picker": "", // 时间选择器
        input: "", // 文本输入框
        "input.number": "", // 数字输入框
        switch: false, // 开关
        select: "", // 下拉选择器
        link: "", // 文字链接
        "time-picker": '', // 时间范围选择器
        "radio-group": "", // 单选框组
        "checkbox-group": [], // 多选框组
        "input-number": 0, // 计数器
        cascader: "", // 级联选择器
        autocomplete: "", // 远程搜索
        "upload-image": [], // 图片上传
        "upload-button": [], // 上传-按钮
        "upload-select": [], // 上传-下拉框
        'select-tree': '', // 选择树
        't-table': null,
        "button-group": "",
        "form-list": [],
        unknown: "", // 未知的
      }), // 受支持的预设控件
    };
  },
  watch: {
    column() {
      this.collatingDataStructures();
      this.$emit("created", { form: this.form });
    },
    currentPanel(newValue, oldValue) {
      // 切换面板
      if (this.splitPanelData) {
        // 数据隔离 重置表单和验证规则
        this.backupPanelData[`form-${oldValue}`] = this.form;
        this.backupPanelData[`rules-${oldValue}`] = this.rules;
        if(this.backupPanelData[`form-${newValue}`]){
          this.form = this.backupPanelData[`form-${newValue}`];
          this.rules = this.backupPanelData[`rules-${newValue}`];
        }else{
          this.form = {};
          this.rules = {};
          
          // 初始化
          this.collatingDataStructures();
          // this.$emit("created", { form: this.form }); // todo
        }
      };
      this.internalFormLabelWidth = "auto";
      this.$nextTick(() => {
        this.setLabelWidth();
      })
    },
  },
  computed: {
    internalBreakpoint(){
      return Object.assign({
        xl: 1920,
        lg: 1200,
        md: 992,
        sm: 768,
        xxs: 520,
        xs: 520
      }, (this.breakPoint || this.$TFOM?.breakPoint))
    },
    internalColProps(){
      let obj =  this.colProps || (this.$TFORM || this.$TTABLE || {}).colProps;
      return obj || {
        span: 24,
        xl: 6,
        lg: 6,
        md: 8,
        sm: 12,
        xxs: 12,
        xs: 24
      };
    },
    /**
     * @computed internalGetDicts
     * @desc 获取字典数据
     */
    internalGetDicts(){
        return this.getDicts || (this.$TFORM || this.$TTABLE || {}).getDicts;
    },
    /**
     * @computed internalDictFieldNames
     * @desc 字典字段名称
     */
    internalDictFieldNames(){
      return Object.assign({
        label: 'dictLabel',
        value: 'dictValue'
      }, (this.$TFORM || this.$TTABLE || {}).dictFieldNames, this.dictFieldNames)
    },
    getFormItems() {
      if (this.currentPanel) {
        // 存在面板设置但是没有数据隔离时
        return this.column.filter((item) => {
          return item.panel === this.currentPanel && this.getFormVisible(item);
        });
      } else if(this.search){
        return this.column.filter(item => {
          return this.getFormVisible(item);
        });
      }else {
        return this.column.filter(item => {
          return !item.hasOwnProperty('panel') && this.getFormVisible(item);
        });
      }
    },
    
    /**
     * 设置form-label标签宽度
     */
    getFormLabelWidth() {
      if(this.formLabelWidth){
        return this.formLabelWidth
      }else{
        return this.internalFormLabelWidth;
      }
    },
    
    defaultWidth() {
      // 分列宽度
      return parseInt((100 / this.internalCols) * 100000) / 100000;
    },
    
  },
  created() {
    this.collatingDataStructures();
    getFieldType(this.cols) === 'Object' && this.setGrid() && window.addEventListener("resize", this.setGrid)
    this.$emit("created", { form: this.deepClone(this.form) });
  },
  
  render(h){
    /**
     * @param {Object} params.column - formList column配置项
     * @param {Object} params.modelForm - 数据绑定对象
     * @param {String} params.listProp - 逐层传递的prop, 用于动态增减表单项formList内的<form-item/>的prop
     * @param {Number} params.cols - formList内部分列数
     * @param {Number} params.averageWidth - 根据formList内部分列数计算出的宽度
     * @param {Number} params.colsWidth - formList内部设置的子项统一宽度
     */
    const formListRender = ({column, modelForm, listProp, cols, averageWidth, colsWidth }) => {
      const {prop, columns, control} = column;
      if(Array.isArray(modelForm[prop])){
        let { creatorButtonProps, copyIconProps, deleteIconProps} = this.getFormListBindValues({control, value: modelForm[prop]});
        return <div class="form-list">
          {
            modelForm[prop].map((item, listIndex) => <div key={listIndex} class="form-list-item">
            {formListItemsRender({columns, modelForm: item, listProp, listIndex, prop, cols, averageWidth, colsWidth })}
            {
              (copyIconProps !== false || deleteIconProps !== false) && <div class="form-list-item-action">
                {copyIconProps !== false && <i onClick={() => this.handleFormListItemCopy({modelForm, prop, item})} class={copyIconProps.icon} title={copyIconProps.title}></i>}
                {deleteIconProps !== false && <i onClick={() => this.handleFormListItemDelete(modelForm[prop], listIndex)} title={deleteIconProps.title} class={deleteIconProps.icon}></i>}
              </div>
              }
          </div>)
          }
          <el-button 
            onClick={() => this.handleFormListCreator({modelForm, creatorRecord: control?.creatorRecord, prop, columns}) } 
            props={{...creatorButtonProps}}
            class="form-list-creator-button">
            {creatorButtonProps.text}
          </el-button>
        </div>
      }else{
        console.error(`❌${column.label ? `标签名为🔖${column.label}的`: ""}表单项👉`, column, `应用的组件 form-list 的期望值必须是数组，当前却是${getValueTypeText(modelForm[prop])}`, modelForm[prop])
      }
      
    };

    const getValueTypeText = (value) => {
      let type = getFieldType(value);
      let textObj = {
        'String': '字符串',
        'Number': '数字',
        'Object': '对象💑',
        'Array': '数组',
        'Null': 'Null',
        'Undefined': 'Undefined'
      };
      return textObj[type] ? textObj[type] : "";
    };

    const formListItemsRender = ({columns, modelForm, listProp, listIndex, prop, cols, averageWidth, colsWidth}) => {
      return columns.map((item) => {
        const curProp = listProp ? `${listProp}.${listIndex}.${item.prop}` : `${prop}.${listIndex}.${item.prop}`;
        return <el-form-item
          key={item.prop}
          prop={curProp} // 
          label={this.setFormItemLabel(item)}
          rules={this.getFormListItemRules(item)}
          label-width={item.formLabelWidth} // ???
          class={this.setFormItemClass(item)}
          style={this.setFormListItemStyle({item, cols, averageWidth, colsWidth})} // ???
        >
          {
            formComponentRender(item, modelForm, curProp)
          }
        </el-form-item>
      })
    };

    const inputAppendRender = (item) => {
      if(item.appendText || item.appendIcon){
        return <div slot="append" on={this.getControlEvents(item)}>
          {
            item.appendIcon && <i class={item.appendIcon}></i>
          }
          {
            item.appendText && <span class="append-text">{ item.appendText }</span>
          }
        </div>
      }
    };

    const formComponentRender = (item, modelForm, listProp) => {
      const slotName = `form-${item.prop || item.key}`; // ??? listProp
      if(this.$scopedSlots[slotName] || this.$slots[slotName]){
        // form-list row???
        return this.$scopedSlots[slotName]({form: this.form, mode: this.currentMode, value: item.prop ? this.form[item.prop] : undefined}) || this.$slots[slotName];
      };

      if(typeof item.formRender === 'function'){
        return <customRender renderContent={item.formRender} data={{form, mode: this.currentMode}} />
      }else if(item.editType === 'input'){
        return <el-input 
        v-model={modelForm[this.getProp(item)]}
        on={this.getControlEvents(item)}
        size={this.size}
        disabled={this.setDisabled(item.disabled)}
        readonly={this.setReadonly(item.readonly)}
        props={{...this.getControlProperty(item)}}
        placeholder={this.getPlaceholder(item)}
        >
          {
            inputAppendRender(item)
          }
        </el-input>
      }else if(item.editType === 'select'){
        return <el-select
          v-model={modelForm[item.prop]}
          on={this.getControlEvents(item)}
          size={this.size}
          props={{...this.getControlProperty(item)}}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          style="width: 100%"
        >
          {
            this.getOptions(item).map(opt => <el-option
              key={this.returnOptionsFields(item, opt, 'value')}
              label={this.returnOptionsFields(item, opt, 'label')}
              value={this.returnOptionsFields(item, opt, 'value')}
            ></el-option>)
          }
        </el-select>
      }else if(item.editType === 'date-picker'){
        return <el-date-picker
          v-model={modelForm[item.prop]}
          on={this.getControlEvents(item)}
          size={this.size}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          props={{...this.getControlProperty(item)}}
          style="width: 100%"
        ></el-date-picker>
      }else if(item.editType === 'radio-group'){
        return <el-radio-group
          v-model={modelForm[item.prop]}
          on={this.getControlEvents(item)}
          size={this.size}
          disabled={this.setDisabled(item.disabled)}
          props={{...this.getControlProperty(item)}}
        >
          {
            this.getOptions(item).map((opt, optIndex) => <el-radio
              key={optIndex}
              label={this.returnOptionsFields(item, opt, 'value')}
            >
              {this.returnOptionsFields(item, opt, 'label')}
            </el-radio>)
          }
        </el-radio-group>
      }else if(item.editType === 'switch'){
        return <el-switch
          v-model={modelForm[item.prop]}
          on={this.getControlEvents(item)}
          size={this.size}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          props={{...this.getControlProperty(item)}}
        ></el-switch>
      }else if(item.editType === 'link'){
        return <el-link
          v-model={modelForm[item.prop]}
          on={this.getControlEvents(item)}
          size={this.size}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          props={{...this.getControlProperty(item)}}
          >{ item.linkText ? item.linkText : "el-link" }
        </el-link>
      }else if(item.editType === 'time-picker'){
        return <el-time-picker
          v-model={modelForm[item.prop]}
          on={this.getControlEvents(item)}
          size={this.size}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          props={{...this.getControlProperty(item)}}
          style="width: 100%"
        >
        </el-time-picker>
      }else if(item.editType === 'checkbox-group'){
        return <el-checkbox-group
          v-model={modelForm[item.prop]}
          on={this.getControlEvents(item)}
          size={this.size}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          props={{...this.getControlProperty(item)}}
        >
          {
            this.getOptions(item).map((opt, optIndex) => <el-checkbox
              key={optIndex}
              label={this.returnOptionsFields(item, opt, 'value')}
            >
              {this.returnOptionsFields(item, opt, 'label')}
            </el-checkbox>)
          }
        </el-checkbox-group>
      }else if(item.editType === 'input-number'){
        return <el-input-number
          v-model={modelForm[item.prop]}
          on={this.getControlEvents(item)}
          size={this.size}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          props={{...this.getControlProperty(item)}}
        ></el-input-number>
      }else if(item.editType === 'cascader'){
        return <el-cascader
          v-model={modelForm[item.prop]}
          size={this.size}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          options={this.getOptions(item)}
          props={{...this.getControlProperty(item)}}
          on={this.getControlEvents(item)}
          style="width: 100%"
        ></el-cascader>
      }else if(item.editType === 'autocomplete'){
        return <el-autocomplete
          v-model={modelForm[item.prop]}
          size={this.size}
          on={this.getControlEvents(item)}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          props={{...this.getControlProperty(item)}}
          style="width: 100%"
        ></el-autocomplete>
      }else if(item.editType === 'upload-button'){
        return <TuploadButton 
          onChange={this.submitFormValidation(item, 'change')}
          control={this.getControlProperty(item)}
          size={this.size}
          fileList={this.form[item.prop]} >
        </TuploadButton>
      }else if(item.editType === 'upload-image'){
        return  <TuploadImages 
          on={{
            change: () => this.setUploadImage($event, item),
            uploadTaskEnd: this.handleUploadTaskEnd
          }}
          mode={this.currentMode}
          props={{...this.getControlProperty(item)}}
          fileList={this.form[item.prop]} 
          ></TuploadImages>
      }else if(item.editType === 'select-tree'){
        return <el-select-tree 
          v-model={modelForm[item.prop]}
          props={{...this.getControlProperty(item), props: this.getSelectTreeProps(item)}}
          disabled={this.setDisabled(item.disabled)}
          readonly={this.setReadonly(item.readonly)}
          on={this.getControlEvents(item)}
          data={this.getOptions(item)}
          size={this.size}
          style="width: 100%"
          />
      }else if(item.editType === 't-table'){
        return <Ttable
          ref={'t-table-' + item.prop}
          data={this.getTtableData(item)}
          disabled={this.setDisabled(item.disabled)} 
          props={{...this.getControlProperty(item)}}
          isFormComponent={true}
          formData={this.form}
          on={this.getControlEvents(item)}
          attrs={this.$attrs}
          {...{
            scopedSlots: this.getTtableSlots(item)
          }}
        />
      }else if(item.editType === 'form-list' && Array.isArray(item.columns)){
        return h('Cols', {
          props: {
            breakpoint: this.internalBreakpoint,
            cols: typeof item.control === 'function' ? item.control({
              value: modelForm[item.prop],
              form: this.form,
              dicts: this.dicts,
              column: item,
              instance: this
            }).cols : item.control?.cols,
          },
          scopedSlots: {
            default: ({cols, averageWidth}) => {
              return formListRender({column: item, modelForm, listProp, cols, averageWidth, colsWidth: item.colsWidth})
            }
          }
        })
      }else if(item.editType ===  'button-group'){
        return <div style={{display: 'flex', alignItems: 'center',height: '100%', justifyContent: item.justifyContent}}>
          {
            item.options.map((opt, index) => <el-button
              key={index}
              onClick={() => this.customButtonEvents(opt)}
              type={this.getPropertyValue(opt, "type")}
              icon={this.getPropertyValue(opt, "icon")}
              title={this.getPropertyValue(opt, "title")}
              plain={this.getPropertyValue(opt, "plain")}
              round={this.getPropertyValue(opt, "round")}
              circle={this.getPropertyValue(opt, "circle")}
              disabled={this.setDisabled(opt.disabled)}
              size={this.size}
              class={this.getPropertyValue(opt, "class")}
            >
              { opt.label }
            </el-button>)
          }
        </div>
      }else{
        return <span class="unknown-span">{ this.form[item.prop] }</span>
      }
    };

    const formItemsRender = (formItems, modelForm) => {
      return formItems.map(item => <el-form-item
        ref={`el-form-item-${item.prop}`}
        key={item.$key}
        prop={this.getProp(item)}
        label={this.setFormItemLabel(item)}
        label-width={item.formLabelWidth}
        class={this.setFormItemClass(item)}
        style={this.setFormItemStyle(item)}
      >
        {
          formComponentRender(item, modelForm)
        }
      </el-form-item>)
    };

    const formRender = () => {
      return <el-form
        ref="Tform" 
        props={{model: this.form}}
        rules={this.rules}
        size={this.size}
        disabled={this.disabledForm}
        nativeOnSubmit={e => e.preventDefault()}
        label-width={this.getFormLabelWidth}
        label-position={this.labelPosition}
        class={{
          'dynamic-form': true,
          'has-form-list': this.hasFormList,
          'form-items-cover': this.formItemsCover,
        }}
      >
        {formItemsRender(this.getFormItems, this.form)}
      </el-form>
    };

    return formRender();
  },
  mounted(){
    this.setLabelWidth();
    
  },
  destroyed(){
    window.removeEventListener("resize", this.setGrid)
  },
  methods: {
    setGrid(){
      this.internalCols = getCurrentCols(this.internalBreakpoint, this.cols);
      return true;
    },
    /**
     * 设置标签宽度
     */
    setLabelWidth(){
      let labelElements = this.$el.getElementsByClassName('el-form-item__label');
      let labelList = Array.from(labelElements);
      let maxWidth = labelList.reduce((acc, cur) => cur.clientWidth > acc ? cur.clientWidth : acc , 0);
      
      this.internalFormLabelWidth = maxWidth + 1 + 'px'; // 实际显示中部分屏幕存在1px的误差
    },
    // 返回组件form-list的绑定属性
    getFormListBindValues({control, value}){
      let initial = config.defaultControlProperties['form-list'];
      let newValue = typeof control === "function" ? control({value, form: this.form}) : control;
      return deepMerge({}, initial, newValue);
    },
    /**
     * @func handleFormListCreator - form-list 新增数据行
     */
    handleFormListCreator({modelForm, prop, creatorRecord, columns}){
      let record = {};
      columns.forEach(item => {
        item.editType === "form-list" && Array.isArray(item.columns) && (record[item.prop] = [])
      })
      Object.assign(record, creatorRecord);
      modelForm[prop] && modelForm[prop].push(record) || this.$set(modelForm, prop, [record])
      
    },
    /**
     * @func handleFormListItemCopy - form-list 复制数据行到末尾
     */
    handleFormListItemCopy({modelForm, prop, item}){
      modelForm[prop].push(this.deepClone(item));
    },
    /**
     * @func handleFormListItemDelete - form-list 删除数据行
     */
    handleFormListItemDelete(list, index){
      list.splice(index, 1);
    },
    /**
     * 保存
     * @param {String} type - 保存类型
     */
    handleSave(type){
      this.validate(({valid, form}) => {
        if(valid){
          this.internalCurrentMode = type || 'new'; // 标记操作类型
          if(this.checkUploadFiles(form)){
            // 存在需要自动上传的文件
            return;
          };
          this.$emit('change', {
            type: 'save', 
            form: form, 
            dicts: this.dicts, 
            mode: this.internalCurrentMode, 
            panel: this.currentPanel,
          })
        }
      })
    },
    /**
     * 检查并上传文件
     */
    checkUploadFiles(form){
      this.uploadTasks =  0;
      this.getFormItems.forEach(item => {
        if(['upload-image'].indexOf(item.editType) > -1 ){
          let refName = `${item.editType}-${item.prop}`;
          if(this.isAutoUpload(refName) && this.findReadyFile(form[item.prop])){
            this.uploadTasks++; // 标记上传任务数量
            this.submitUpload(refName)
          }
        }
      });
      return this.uploadTasks;
    },
    waitForUploadTasksEnd(){

    },
    /**
     * 是否存在未上传的文件
     */
    findReadyFile(arr){
        return arr.some(item => item.status === 'ready')
    },
    /**
     * 获取prop
     */
    getProp(item){
      return item.module ? `${item.module}-${item.prop}` : item.prop;
    },
    getFormVisible(item) {
      let type = typeof item.formVisible;
        return type === "boolean"
          ? item.formVisible
          : type === "function"
          ? item.formVisible({
              value: this.form[item.prop],
              form: this.form,
              panel: this.currentPanel,
              mode: this.currentMode,
              instance: this
            })
          : true;
    },
    getFormItemCols(data){
      let width = window.innerWidth;
      if(width >= 1920 && data.xl){
        return data.xl ;
      }else if(width >= 1200 && data.lg){
        return data.lg;
      }else if(width >= 992 && data.md){
        return data.md;
      }else if(width >= 768 && data.sm){
        return data.sm;
      }else if(width >= 520 && data.xxs){
        return data.xxs;
      }else if(width < 520 && data.xs){
        return data.xs;
      }else{
        return data.span || 1;
      }
    },
    formItemWidth(item) {
      // 返回表单项宽度
      if(item.colWidth){
        return typeof item.colWidth === "number" ? item.colWidth + "px" : item.colWidth;
      }else if(item.cols){
        let itemCols = typeof item.cols === "number" ? item.cols : (getFieldType(item.cols) === 'Object' ? this.getFormItemCols(item.cols) : 1);
        let cols = itemCols > 0 && itemCols <= this.internalCols ? itemCols : 1;
        return cols * this.defaultWidth + "%";
      }else if(this.colsWidth){
        return typeof this.colsWidth === "number" ? this.colsWidth + "px" : this.colsWidth;
      }else{
        return this.defaultWidth + "%"
      };
    },
    /**
     * 返回select-tree的props
     */
    getSelectTreeProps(item){
      if(item.control && item.control.props){
        return item.control.props;
      }else{
        //
        let props = {label: 'label', value: 'value', children: 'children'};
        if(item.optionFieldNames){
          return Object.assign(props, item.optionFieldNames);
        }else{
          return props;
        }
      }
    },
    /**
     * 设置只读
     */
    setReadonly(readonly){
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
    },
    /**
     * 返回字典字段名
     */
    getDictFieldNames(item){
      return Object.assign({}, this.internalDictFieldNames, item.dictFieldNames)
    },
    /**
     * 返回选项列表字段值配置
     */
    returnOptionsFields(item, opt, field){
      if(item.dict){
        let key = this.getDictFieldNames(item)[field];
        return opt[key];
      }else if(item.optionFieldNames){
        return opt[item.optionFieldNames[field]];
      }else{
        return opt[this.optionFieldNames[field]];
      }; 
    },
    setDisabled(disabled) {
      // 禁用表单项
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
            instance: this
          })
        : undefined;
    },
    /**
     * 返回表格data
     */
    getTtableData(item){
      let options = this.form[item.prop] || this.dicts[item.dict] || (typeof item.options === "string" && this.$attrs[item.options]) || item.options;
      if(options){
        return options
      }else if(Array.isArray(this.form[item.prop])){
        return this.form[item.prop];
      }else {
        this.form[item.prop] = [];
        return this.form[item.prop];
      }
    },
    /**
     * @func getTtableSlots 获取表格插槽
     * @returns {Object.<string, Function>} 表单插槽渲染方法的集合
     */
    getTtableSlots(item){
      let scopedSlots = {};
      for(let i in this.$scopedSlots){
          if(i.indexOf(`form-${item.prop}/`) > -1){
            let j = i.split('/')[1];
            if(j){
              scopedSlots[j] = params => {
                return this.$scopedSlots[i] ? this.$scopedSlots[i](params) : this.$slots[i];
              }
            }
          }
      }
      return scopedSlots;
    },
    /**
     * 批量绑定控件事件
     */
    getControlEvents(item) {
      let controlEvents = {};
      if (typeof item.controlEvents === "object") {
        for (let i in item.controlEvents) {
          controlEvents[i] = (value) => {
            let option = this.findOption(item, value);
            let take = {
              value,
              form: this.form,
              option,
              dicts: this.dicts,
              column: item,
              instance: this,
            };
            
            typeof item.controlEvents[i] === "function"
              ? item.controlEvents[i](take)
              : () => {
                };
          };
        }
        return controlEvents;
      } else {
        return controlEvents;
      }
    },
    /**
     * 查找当前选中项
     */
    findOption(column, value){
      if(column.options || column.dict){
        let options = this.getOptions(column);
        let valueKey = (column.dict && this.getDictFieldNames().value) || (column.optionFieldNames && column.optionFieldNames.value) || this.optionFieldNames.value;
        return options.find(item => item[valueKey] === value)
      };
      return null;
    },
    /**
     * 返回数据列表
     */
    getOptions(item) {
      let list = this.dicts[item.dict] || this.$attrs[item.options] || item.options || [];
      return  Array.isArray(list) ? list : [];
    },
    /**
     * 返回FormItem style
     */
    setFormItemStyle(item){
      let style = {
        width: this.grid ? undefined : this.formItemWidth(item),
        paddingLeft: this.gutter / 2 + 'px',
        paddingRight: this.gutter / 2 + 'px',
        flex: item.flex,
        ...item.formItemStyle
      };
      item.editType === 'upload-image' && (style.marginBottom = '7.6px');
      return style;
    },
    /*
    * @param {Object} params.item - 当前表单项
    * @param {number} params.cols - 来自<form-list/>，表单布局的列数，用于计算每列宽度的比例
    * @param {number} params.averageWidth - 根据 cols 计算出的平均宽度
    * @param {string|number} params.colsWidth - 来自<form-list/>，可统一设置每列的宽度
    * @returns {string} 计算得到的宽度
    */
    getFormListItemStyleWidth({item, cols, averageWidth, colsWidth}){
      if(item.colWidth){
        return typeof item.colWidth === "number" ? item.colWidth + "px" : item.colWidth;
      }else if(item.cols){
        let itemCols = typeof item.cols === "number" && item.cols > 0 && item.cols <= cols ? item.cols : 1;
        return itemCols * averageWidth + "%";
      }else if(colsWidth){
        // 如果form-list设置了表单项统一宽度colsWidth
        return typeof colsWidth === "number" ? colsWidth + "px" : colsWidth;
      }else{
        return averageWidth + "%";
      }
    },
    /**
     * @func setFormListItemStyle - formListItem style
     */
    setFormListItemStyle({item, cols, averageWidth, colsWidth}){
      
      let style = {
        width: this.getFormListItemStyleWidth({item, cols, averageWidth, colsWidth}),
        flex: item.flex
      };
      console.log("setFormListItemStyle", style)
      item.editType === 'upload-image' && (style.marginBottom = '7.6px');
      return style;
    },
    /**
     * 返回FormItem label
     */
    setFormItemLabel(item){
      let label = item.formLabel || item.label;
      let type = typeof label;
      if(type === 'string' || type === 'number'){
        return label;
      }else if(type === 'function'){
        return label({
          form: this.form,
          dicts: this.dicts,
          column: item,
          instance: this,
        })
      };
    },
    /**
     * 返回FormItem class
     */
    setFormItemClass(item){
      let classList = {};
      if(this.grid === true){
        let colProps = Object.assign({}, this.internalColProps, item.colProps);
        ['span', 'offset', 'pull', 'push'].forEach(prop => {
          if (colProps[prop] || colProps[prop] === 0) {
            classList[prop !== 'span'
                ? `el-col-${prop}-${colProps[prop]}`
                : `el-col-${colProps[prop]}`] = true;
          
          }
        });
        
        ['xs', 'sm', 'md', 'lg', 'xl'].forEach(size => {
          if (typeof colProps[size] === 'number') {
            classList[`el-col-${size}-${colProps[size]}`] = true;
          } else if (typeof colProps[size] === 'object') {
            let props = colProps[size];
            Object.keys(props).forEach(prop => {
              classList[prop !== 'span'
                  ? `el-col-${size}-${prop}-${props[prop]}`
                  : `el-col-${size}-${props[prop]}`] = true;
            });
          }
        });
      }

      return {
        ...classList,
        'form--item-label-left': item.labelPosition === 'left',
        'form--item-label-center': item.labelPosition === 'center',
        'form--item-label-right': item.labelPosition === 'right',
        'form--item-label-top': item.labelPosition === 'top',
      }
    },
    /**
     * @method getFormListItemRules - 返回组件<form-list/>中<form-item/>的验证规则rules
     */
    getFormListItemRules(column){
      let validator = column.formValidator || column.validator;
        if (Array.isArray(validator)) {
          return validator; // 数组 直接返回
        }
        let validate = {
          required: column.required === true ? true : false,
          trigger: column.validateTrigger ? column.validateTrigger : this.getInputTrigger(column.editType),
        }; // 验证

        let validatorType = getFieldType(validator);
        // 优先设置特殊组件验证规则
        this.setSpecialItemsValidator(validate, validator, validatorType, column);
        // 其他验证
        if(!validate.validator){
          this.setValidator(validate, validator, validatorType, column)
        }
        
        return [validate];
    },
    /**
     * 返回输入控件的验证触发方式
     */
    getInputTrigger(type){
      if(['input', 'input-number', 'autocomplete'].indexOf(type) > -1){
        return ['blur', 'change'];
      }else{
        return 'change'
      }
    },
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
    getCurrentPanelColumns(){
      return this.column.filter(item => item.panel === this.currentPanel);
    },
    // 整理数据结构
    collatingDataStructures() {
      let columns = this.currentPanel && this.splitPanelData ? this.getCurrentPanelColumns() : this.column;
      columns.forEach((item) => {
        item.$key = getId(true);
        if(!item.prop || item.propAsKeyOnly){return};
        item.editType =
          this.supportedComponents[item.editType] !== undefined ? item.editType : "unknown";
        const prop = item.module ? `${item.module}-${item.prop}` : item.prop; // 分模块
        let defaultValue = item.defaultValue !== undefined ? item.defaultValue : 
        (this.initFields[prop] !== undefined ? this.deepClone(this.initFields[prop]) : 
        this.supportedComponents[item.editType]);

        if(item.editType === "form-list" && Array.isArray(item.columns)){
          this.hasFormList = true;
          this.setFormListDefaultValue(item.columns, defaultValue);
        };
        
        this.$set(this.form, prop, this.deepClone(defaultValue)); // 初始化表单字段数据
        this.defaultFieldsValue[prop] = JSON.parse(JSON.stringify(defaultValue)); // 初始化字段默认值
        

        //// 获取字典
        if (item.dict && !(item.dict in this.dicts)) {
          if(typeof this.internalGetDicts === 'function'){
            this.internalGetDicts({dict: item.dict, callBack: data => {
              if(Array.isArray(data)){
                  this.$set(this.dicts, item.dict, data);
              }else{
                  console.error('The input parameter of the callback function must be an array')
              }
            }})
          }else{
            console.error('The getDicts must be of type function')
          }
        };

        if(this.search){
          return;
        }

        // 校验
        let validator = item.formValidator || item.validator;
        if (Array.isArray(validator)) {
          this.rules[item.prop] = validator; // 数组 直接赋值
          return;
        }
        let validate = {
          required: item.required === true ? true : false,
          trigger: item.validateTrigger ? item.validateTrigger : this.getInputTrigger(item.editType),
        }; // 验证

        let validatorType = getFieldType(validator);
        // 优先设置特殊组件验证规则
        this.setSpecialItemsValidator(validate, validator, validatorType, item);
        // 其他验证
        if(!validate.validator){
          this.setValidator(validate, validator, validatorType, item)
        }
        
        this.rules[prop] = [validate];
      });
    },
    // 设置form-list默认值
    setFormListDefaultValue(columns, value){
      columns.forEach(column => {
        if(column.editType === "form-list" && Array.isArray(column.columns) && column.defaultValue){
          this.setFormListDefaultValue(column.columns, column.defaultValue);
          value.forEach(val => {
            val[column.prop] = column.defaultValue;
          })
        }
      })
    },
    /**
     * * 优先设置特殊组件验证规则
     * @method setSpecialItemsValidator
     * @param {Object} validate 验证器
     * @param {Function} validator 用户自定义验证方法
     * @param {String} validatorType 验证方法的类型
     * @param {Object} item 当前项
     */
    setSpecialItemsValidator(validate, validator, validatorType, item){
      let func = null;
      if(item.editType === 't-table'){
        // 当组件为Ttable时添加默认验证
        if(validatorType === "Function"){
          func = (rule, value, callback) => {
            validator({value, form: this.form, callback});
          };
        }else{
          func = (rule, value, callback) => {
            if(item.required && (!Array.isArray(value) || !value.length) ){
              // 必传
              callback(new Error(`${item.label || item.prop}不能为空`));
              return;
            }
            
            // 此处检查表格数据不需要返回data, 并且校验成功时不需要立即移除提示信息
            if(this.$refs['t-table-' + item.prop].checkTableData(false, false)){
              callback();
            }else{
              console.log("当组件为Ttable时添加默认验证", validatorType)
              callback(new Error('校验失败, 请检查后重新输入'));
            }
          };
        }
        // 添加验证方法到验证器
        validate.validator = func;
      }
    },
    /**
     * 设置组件验证规则
     * @method setSpecialItemsValidator
     * @param {Object} validate 验证器
     * @param {Function} validator 验证方法
     * @param {String} validatorType 验证方法的类型
     * @param {Object} item 当前项
     */
    setValidator(validate, validator, validatorType, item){
      let func = null;
      if (validator) {
        // 自定义验证
        if (validatorType === 'RegExp') {
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
        } else if (validatorType === "Function") {
          func = (rule, value, callback) => {
            validator({value, form: this.form, callback});
          };
        }
        // 添加验证方法到验证器
        validate.validator = func; 
      } else {
        validate.message = item.validateTips
          ? item.validateTips
          : `${item.formLabel || item.label}不能为空`;
      }
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
    //     that.form[prop] = this.result
    //   }
    //   return false
    // },

    // 表单 自定义按钮触发事件
    customButtonEvents(item) {
      if(typeof item.click === 'function'){
        item.click({
          form: this.form,
          dicts: this.dicts,
          column: item,
          instance: this,
        })
        return;
      }
      if(item.target === 'reset'){
        this.resetFields();
      }
      if(item.target === 'submit' || item.target === 'search'){
        if(this.validate()){
          this.$emit('change', {type: item.target, form: this.form, dicts: this.dicts, mode: this.currentMode, panel: this.currentPanel})
          return;
        }
      }
      if(item.target || item.emit){
          this.$emit('change', {type: item.target || item.emit, form: this.form, dicts: this.dicts, mode: this.currentMode, panel: this.currentPanel})
      }
      
    },
    /**
     * 获取属性值
     */
    getPropertyValue(item, prop){
      if(typeof item[prop] === 'function'){
        return item[prop]({
          form: this.form,
          dicts: this.dicts,
          column: item,
          instance: this,
        })
      }else{
        return item[prop];
      }
    },
    /**
     * 自定义按钮plain
     */
    getCustomButtonPlain(item){
      let type = typeof item.plain;
      if(type === 'boolean'){
        return item.plain;
      }else if(type === 'function'){
        return item.plain({
          form: this.form,
          dicts: this.dicts,
          column: item,
          instance: this,
        })
      };
      return false;
    },
    /**
     * 自定义按钮class
     */
    getCustomButtonClass(item){
      if(typeof item.class === 'string'){
        return item.class;
      }else if(typeof item.class === 'function'){
        return item.class({
          form: this.form,
          dicts: this.dicts,
          column: item,
          instance: this,
        })
      }
      return '';
    },
    // 校验并获取表单数据
    validate(func) {
      let validResult = false;
      this.$refs.Tform.validate((valid) => {
        if (valid) {
          validResult = true;
        } else if(this.showValidationFailsMessage){
          this.$message({
            type: "error",
            message: "表单验证失败, 请检查完善后再试!",
          });
        }
        if (typeof func === "function") {
          let mergeForm = Object.assign(this.deepClone(this.initFields), this.form);
          func({valid, form: valid ? this.deepClone(mergeForm) : null, module: valid ? this.getFormModule() : null});
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
            this.column.forEach(item => {
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
            this.column.forEach(item => {
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
      this.$refs.Tform.validateField(item.prop);
    },
    validateField(prop){
      if(prop){
        this.$refs.Tform.validateField(prop);
      }
    },
    /**
     * 更新表单数据
     */
    updateFields(target) {
      for (let i in target) {
        this.$set(this.form, i, target[i]);
      }
    },
    // 重置表单数据
    resetFields(manualReset) {
      this.otherData = {}; // 重置其他备用数据
      if (manualReset) {
        let copy = this.deepClone(this.defaultFieldsValue);
        for (let i in this.form) {
          this.form[i] = copy[i];
        };
        this.$nextTick(() => {
          this.clearValidate();
        })
      }else{
        // 当表单中中塞入非初始化的数据时,resetFields会造成数据异常
        this.$refs.Tform.resetFields();
      }
    },
    // 清理校验信息
    clearValidate(){
      this.$refs.Tform.clearValidate();
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
      if(this.$refs.Tform){
        this.submitFormValidation(item, 'change')
      }
    },
    /**
     * 图片上传结束
     */
    handleUploadTaskEnd(params){
      this.uploadTasks--;
      if(!this.uploadTasks){
        // 所有上传任务结束
        if(!params.error){
          this.$emit("uploadTaskEnd", params);
          if(!this.isTableComponent){
            // 非表格的子组件时，再次调用保存
            this.handleSave();
          }
        }
      }
    },
    // 文件超出限制数量
    exceedQuantityLimit(file, fileList, item) {
      this.$message.error(
        `${item.label}的上传文件数量不能超过${item.control.limit}个！`
      );
    },
    /**
     * 判断图片组件是否能使用内置的submit方法
     * 传递了action
     */
    isAutoUpload(name){
      if(this.$refs[name] && this.$refs[name][0]){
        return this.$refs[name][0].action;
      }
      console.error(`ref引用名为${name}的组件不存在！`)
      return false;
    },
    submitUpload(prop) {
      // 手动上传
      if (prop) {
        this.$refs[prop][0].submitUpload();
      }
    },
    handleUploadError(err, file, fileList, item) {
      // 上传失败
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
    },
    /**
     * @method getControlProperty
     * @param {Object} item - 当前表单项
     * 返回控件属性
     */
    getControlProperty(item) {
      if(config.defaultControlProperties.hasOwnProperty(item.editType)){
        let { editType, control } = item;
        let _config = deepClone(config.defaultControlProperties[editType]);
        // 动态返回控制属性
        if(getFieldType(control) === "Function"){
          control = control({
            value: this.form[item.prop],
            form: this.form,
            dicts: this.dicts,
            column: item,
            instance: this
          })
        };
        if (getFieldType(control) === "Object") {
          Object.assign(_config, control);
        };

        // cascader的options和lazy动态加载不能同时存在, 否则将造成选中后不能回显的问题!
        if (editType == "cascader" && !control?.prop?.lazy) {
          _config.options = this.getOptions(item);
        };

        if(editType === 't-table'){
          Object.assign(_config, this.$attrs);
        };

        return _config;
      }
      return {};
    },

    getPlaceholder(item){
      if(item.editType === 'input'){
        return '请输入'
      }
    },
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
      .form-list{
        .form-list-item {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          &-action {
            position: absolute;
            right: -10px;
            transform: translateX(100%);
            white-space: nowrap;
            i + i {
              margin-inline-start: 8px;
            }
            i {
              cursor: pointer;
              &:hover{
                color: #66B1FF;
              }
              &:active{
                color: #409EFF;
              }
            }
          }
        }
        .form-list-creator-button{
          width: 100%;
          color: rgba(42, 46, 54);
          box-shadow: 0 2px 0 rgba(42, 46, 54, 0.02);
          border-radius: 6px;
          border: 1px dashed #d9d9d9;
          transition: .2s;
          user-select: none;
          &:hover {
            border-color: #66B1FF;
            color: #66B1FF;
            cursor: pointer;
          }
          &:active{
            border-color: #409EFF;
            color: #409EFF;
          }
        }
      }
      
    }
    .el-range-editor.is-disabled{
      background-color: transparent;
    }
    .is-disabled {
      cursor: default;
      .el-input__inner,
      input {
        cursor: default;
        background-color: transparent;
      }
      .el-textarea__inner {
        cursor: default;
        background-color: transparent;
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

    .el-radio input[aria-hidden="true"] {
      display: none !important;
    }

    .el-radio:focus:not(.is-focus):not(:active):not(.is-disabled) .el-radio__inner {
      box-shadow: none !important;
    }
  }
  .form--item-label-top{
    display: block;
    ::v-deep.el-form-item__label{
      text-align: left;
    }
  }

  .ml-4 {
    margin-left: 4px;
  }
}

.has-form-list{
  padding-right: 42px;
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
