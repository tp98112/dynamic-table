import $ from '../propsValidator.js';
export default{
    props: {
        dynamic:{
            /** 为true时开启操作栏 动态新增和删除行 */ 
            type: Boolean,
            default: false // 默认只读
        },
        column: {
            // 表头配置
            type: Array,
            default(){
                return []
            }
        },
        data: {
            // 表格数据
            type: Array,
            default(){
                return []
            }
        },
        integrateAllEventsIntoTheEmitNamedChange: {
            // 将所有事件集成到名为change的自定义触发事件中
            type: Boolean,
            default: true
        },
        loadData: {
            // 为true时将触发一次分页事件
            type: Boolean,
            default: false
        },
        unifiedEdit:{
            /** 为true时统一编辑和保存 为false时为单行独立增删改 */ 
            type: Boolean,
            default: false
        },
        confirmBeforeDelete:{
            /** 删除事件是否二次确认 */ 
            type: Boolean,
            default: true
        },
        initFields: {
            // 初始化字段 可在此设置字段默认值
            type: Object,
            default(){
              return {}
            }
        },
        optionControl: {
            // 选项列表字段控制
            type: Object,
            default(){
                return {
                    label: 'label',
                    value: 'value'
                }
            }
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
        loading: {
            // 表格数据loading
            type: Boolean,
        },
        align: {
            // 表格单元格对齐方式
            type: String,
            default: 'center'
        },
        indexSortBy: {
            // 表格索引排序方式 absolute / relative
            type: String,
            default: 'absolute'
        },
        border: {
            // 表格边框
            type: Boolean,
            default: false
        },
        stripe: {
            // 斑马纹
            type: Boolean,
            default: undefined
        },
        tableSize: {
            // 表格尺寸 medium / small / mini
            type: String,
            validator(val){
                return ['medium', 'small', 'mini'].indexOf(val) > -1;
            }
        },
        autoContainerHeight: {
            // 自适应容器高度
            // 表格自适应容器高度时，容器可使用overflow: auto防止表格将原本自适应的高度撑大
            type: Boolean,
            default: false
        },
        subtractHeight:{
            // 自适应容器高度时需要减去的高度
            type: Number,
        },
        sumText: {
            // 合计行第一列文字
            type: [String, Number],
            default: '合计'
        },
        showSummary: {
            // 表尾合计
            type: Boolean,
            default: false
        },
        getSummaries: {
            // 表尾合计方法
            type: Function,
        },
        highlightCurrentRow: {
            // 单选
            type: Boolean,
            default: true
        },
        spanMethod: {
            // 合并方法
            type: Function,
        },
        defaultExpandAll: {
            // 当存在树形数据或展开行时 是否展开所有行
            type: Boolean,
            default: false
        },
        treeProps: {
            // 树形表格配置
            type: Object,
            default(){
                return {children: 'children', hasChildren: 'hasChildren'}
            }
        },
        reserveSelection: {
            // 仅对 type=selection 的列有效，类型为 Boolean，为 true 则会在数据更新之后保留之前选中的数据（需指定 row-key）
            type: Boolean,
            default: false
        },
        height: {
            // 表格高度
            type: [Number,String],
        },
        maxHeight: {
            // 表格最大高度
            type: [Number,String],
        },
        rowKey: {
            // 树形表格配置
            type: String,
        },
        errorCellBlink: {
            // 闪烁校验错误的单元格(行内编辑时)
            type: Boolean,
            default: true
        },
        cellErrorStyle: {
            // 校验失败的标记样式 在el-table__cell上
            type: Object,
            default(){
                return {backgroundSize: '20px 20px', backgroundColor: '#409EFF',backgroundImage: 'linear-gradient(-45deg, rgba(255, 255, 255, .2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .2) 50%, rgba(255, 255, 255, .2) 75%, transparent 75%, transparent)'}
            }
        },
        dblClickToEditCell: {
            // 双击编辑单元格
            type: Boolean,
            default: false
        },
        editMode: {
            // 编辑方式 表格内编辑 / 弹窗编辑
            type: String,
            default: 'window'
        },
        refreshTableOnSuccess: {
            // 当设置内的事件被触发时, 将触发一次刷新当前页的事件
            type: Object,
        },
        insertDataMethod: {
            // 插入数据的方法 push或unshift
            type: [String],
            default: 'unshift',
            validator(val){
                return val === 'unshift' || val === 'push'
            }
        },
        internalPrompt: {
            // 是否显示默认的内置提示
            type: Boolean,
            default: true
        },
        showAction: {
            /** 操作栏显隐状态 */ 
            type: Boolean,
            default: undefined
        },
        actionAlign: {
            // 操作栏按钮对齐方式 left/center/right
            type: String,
            default: 'center'
        },
        addButtonControl: {
            // 新增按钮配置(根)
            type: Object,
            default(){
                return {}
            },
            validator(val){
                if(val.hasOwnProperty('location')){
                    return ['header', 'append', 'bottom'].indexOf(val.location) > -1;
                };
                return true;
            }
        },
        accessControl: {
            // 按钮访问控制
            // 1. 字符串 根据判断当前行的该字段是否为true确认权限
            // 2. 方法 必须返回结果
            // 3. 布尔值
            type: Object,
            validator(obj){
                let arr_type = ['string', 'boolean', 'function'];
                let check = true;
                for(let key in obj){
                    let type = typeof obj[key];
                    // root 不能为字符串
                    if(arr_type.indexOf(type) < 0 || (key === 'root' && type === 'string')){
                        check = false;
                        break;
                    }
                    
                };
                return check
            },
        },
        actionBarWidth: {
            // 操作栏宽度
            type: Number,
        },
        // 内置的操作按钮 类型
        actionButtonType: {
            type: String,
            default: 'link'
        },
        actionButtonSize: {
          // 操作栏按钮大小
            type: String,
            default: 'mini'
        },
        // actionButtonFontSize: {
        //   // 操作栏按钮的字体大小 button/link
        //   type: Object,
        //   validator(value){
        //     if(value.hasOwnProperty('link') && typeof value.link !== 'number' || value.hasOwnProperty('button') && typeof value.button !== 'number'){
        //       console.error('The value of "link" and "button" properties in actionButtonFontSize must be a number');
        //       return false;
        //     }
        //   }
        // },
        actionBarWidthParams:{
          // 用于计算操作栏宽度的相关参数
          type: Object,
          validator(obj){

          }
        },
        pagination: {
            // 是否展示分页
            type: Boolean,
            default: false
        },
        virtualPage: {
            // 假分页
            type: Boolean,
            default: false
        },
        layout: {
            // 分页工具配置
            type: String,
            default: 'total, sizes, prev, pager, next, jumper'
        },
        pageSizes: {
            // 分页大小配置
            type: Array,
            default(){
                return [10, 50, 100, 150]
            }
        },
        pageSizeIndex: {
            // 当前分页大小 根据下标从pageSizes中取
            type: Number,
            default: 0
        },
        smallPagination: {
            // 小型分页
            type: Boolean,
            default: false
        },
        total: {
            // 分页总数
            type: Number,
            default: 0
        },
        pagerCount: {
            // 最大页码按钮数 大于等于 5 且小于等于 21 的奇数
            type: Number,
            default: 7
        },
        // 表格底部 对齐方式
        footer_justify: {
            type: String,
            default: 'flex-end'
        },
        rowClassName: {
            // 行的 className 的回调方法，也可以使用字符串为所有行设置一个固定的 className
            type: Function
        },
        cellClassName: {
            // 单元格 className 的回调方法，也可以使用字符串为所有单元格设置一个固定的 className
            type: Function
        },
        defaultSort: {
            // 默认排序方式
            type: Object,
        },
        actionButtons: {
            // 按钮集合
            type: Array
        },
        builtInButtons: {
          // 内置按钮
          type: Array,
          validator(arr){
            let [save, cancel] = [0, 0];
            arr.forEach(item => {
              item.target === 'save' && save++;
              item.target === 'cancel' && cancel++;
            })
            let result = save === 1 && cancel === 1;
            if(result){
              return true
            }else{
              console.error("The builtInButtons property must contain one save button and one cancel button, with their target attribute values set to 'save' and 'cancel' respectively")
            } 
          }
        },
        rowClick: {
            // 行单击事件
            type: Function,
        },
        rowDblclick: {
            // 行双击事件
            type: Function,
        },
        cellDblclick: {
            // 单元格双击事件
            type: Function,
        },
        formColumn: {
            // 编辑表单数据项配置 该值不传时取column
            type: Array,
        },
        splitPanelData: {
            // 编辑表单的不同面板是否启用数据隔离
            type: Boolean,
            default: false
        },
        formCols: {
            // 表单一行放置控件数量
            type: [Number, String],
            default: 2
        },
        closeOnClickModal: {
            // 是否可以通过点击 modal 关闭 Dialog
            type: Boolean,
            default: false
        },
        formDialogButtonSize: {
            type: String,
            default: 'small'
        },
        formDialogWidth: {
            // 表单弹窗宽度
            type: [Number, String],
        },
        formLabelWidth: {
            // 自定义表单标签宽度
            // 不传时默认自动计算宽度
            type: [Number, String],
        },
        formLabelPosition: {
            // 表单标签对齐方式
            type: String,
            default: 'center'
        },
        formGutter: {
            // 表单项间距
            type: Number,
            default: 20
        },
        formColsWidth: {
            // 自定义表单项宽度
            type: String,
        },
        formLabelFontSize: {
            // 表单标签字体大小 用以自动计算表单标签宽度,
            // 如若通过css修改了字体大小 ,请传递该值告知或在此处修改默认值
            type: [Number, String],
            default: 14
        },
        formItemsCover: {
            // 表单项是否铺满容器
            type: Boolean,
            default: true
        },
        formDialogModal: {
            // 是否需要遮罩层
            type: Boolean,
            default: false
        },
        lockScroll: {
            // 是否在 Dialog 出现时将 body 滚动锁定
            type: Boolean,
            default: false
        },
        formDialogButton: {
            // 表单弹窗按钮
            type: Array,
            default(){
                return [
                    {
                        // icon: 'el-icon-refresh-right',
                        label: '取 消',
                        target: '$cancel'
                    },
                    {
                        icon: 'el-icon-circle-check',
                        label: '确 定',
                        type: 'primary',
                        target: '$update'
                    },
                    {
                        // icon: 'el-icon-close',
                        label: '关 闭',
                        target: '$close'
                    },
                ]
            }
        },
        beforeFormClose: {
            // 表单弹框关闭时调用自定义事件
            type: Function,
        },
    },
    computed: {
        /**
         * 表格大小
         */
        internalTableSize(){
            return this.tableSize || (this.$ROCTABLE || {}).tableSize || 'mini';
        },
        /**
         * 斑马纹
         */
        internalStripe(){
            return this.stripe || (this.$ROCTABLE || {}).stripe || true;
        },
      /**
       * 操作栏显隐状态
       */
      internalActionStatus(){
        if(typeof this.showAction === 'boolean'){
            return this.showAction;
        };
        let showAction = (this.$ROCTABLE || {}).showAction;
        if(typeof showAction === 'boolean'){
            return showAction;
        }else if(this.actionButtons || (this.$ROCTABLE || {}).actionButtons){
            return true;
        }
        return false;
      },
      /**
       * @computed internalAccessControl 操作栏按钮访问控制
       * @returns {Object}
       */
      internalAccessControl(){
        let obj = this.accessControl || (this.$ROCTABLE || {}).accessControl;
        return Object.assign({
            root: false, // 根节点新增
            new: true,
            view: true,
            update: true,
            delete: true,
            cancel: true,
            // $开头的为表单弹窗按钮
            $save: true,
            $cancel: true,
            $close: true,
        }, obj)
      },
      /**
       * @computed internalRefreshTableOnSuccess 触发成功回调后需要刷新表格数据的事件
       * @desc 仅限于内置事件 new、update、delete
       * @returns {Object}
       */
      internalRefreshTableOnSuccess(){
        let obj = this.refreshTableOnSuccess || (this.$ROCTABLE || {}).refreshTableOnSuccess;
        return Object.assign({
          new: true,
          update: true,
          delete: true
        }, obj)
      },
      /**
       * @returns 用于计算操作栏宽度的依赖参数
       */
      internalActionBarWidthParams(){
        let obj = this.actionBarWidthParams || (this.$ROCTABLE || {}).actionBarWidthParams;
        return Object.assign({
          cellFillWidth: 12, 
          buttonFillWidth: 32, 
          iconTextSpacing: 5, 
          buttonSpacing: 10, 
          buttonFontSize: 12, 
          linkFontSize: 14
        }, obj);
      },
      /**
       * @computed internalAddButtonControl 新增表格data根数据按钮的配置
       * @returns {Object}
       */
      internalAddButtonControl(){
        let obj = this.addButtonControl || (this.$ROCTABLE || {}).addButtonControl;
        return Object.assign({icon: 'el-icon-plus', text: '新增', type: 'primary', location: 'append'}, obj)
      },
      /**
       * @computed internalActionButtons 自定义操作栏按钮
       * @returns {Array}
       */
      internalActionButtons(){
        return this.actionButtons || (this.$ROCTABLE || {}).actionButtons || [
            {
                // label: '新增', // 按钮或链接的标签
                type: 'primary',
                title: '新增', // 鼠标覆盖时显示的描述信息
                icon: 'el-icon-plus',
                target: 'new',
                plain: true,
                actionName: '新增数据' // 操作名称 打开弹窗时将作为弹窗标题
            },
            {
                type: 'info',
                title: '查看',
                icon: "el-icon-view",
                target: 'view',
                plain: true,
                actionName: '查看数据' // 操作名称 打开弹窗时将作为弹窗标题
            },
            {
                type: 'warning',
                title: '编辑',
                icon: "el-icon-edit",
                target: 'update',
                plain: true,
                actionName: '编辑数据' // 操作名称 打开弹窗时将作为弹窗标题
            },
            {
                type: 'danger',
                title: '删除',
                icon: 'el-icon-delete-solid',
                target: 'delete',
                plain: true
            }
        ];
      },
      /**
       * @computed internalBuiltInButtons 内置按钮
       * @returns {Array}
       */
      internalBuiltInButtons(){
        return this.builtInButtons || (this.$ROCTABLE || {}).builtInButtons || [
          {
              icon: 'el-icon-check',
              title: '保存',
              target: 'save'
          },
          {
              icon: 'el-icon-refresh-right',
              title: '取消',
              target: 'cancel'
          }
        ];
      },
      /**
       * @computed actionButtonExtraWidth 操作栏按钮的补充宽度
       * @desc link类型的按钮补充宽度为0
       * @returns {number}
       */
      actionButtonExtraWidth(){
        return this.actionButtonType === 'button' && this.internalActionBarWidthParams.buttonFillWidth || 0;
      },
      /**
       * @computed 操作栏按钮的文字大小
       * @returns {number}
       */
      actionButtonFontSize(){
        let {buttonFontSize, linkFontSize} = this.internalActionBarWidthParams;
        return this.actionButtonType === 'button' && buttonFontSize || linkFontSize;
      },
      
    }
}

