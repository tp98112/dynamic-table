<script>
import props from './mixins/props.js';
import config from './mixins/config.js';
import methods from './mixins/methods.js';
import {recursiveTraverse, recursiveTraverseBySome, dateFormat, getFieldType, deepClone, getId, isEmpty, getTextWidth, getPageNumber } from "./tools.js";

export default {
    name: 'RocTable',
    inheritAttrs: false,
    mixins: [props, config, methods],
    components: {
        DynamicForm: () => import('./components/DynamicForm'), 
        TpUploadButton: () => import('./components/TpUpload/Button.vue')
    },
    
    data(){
        return {
            backupTableData: {}, // 备份表数据
            dicts: {}, // 字典数据集合
            initFieldsCollection: {}, // 字段集合
            currentEditRow: null, // 当前编辑数据行
            dataLoading: this.loading === true ? true : false, // 表格数据loading
            currentPage: 1, // 当前页码
            currentPageSize: this.pageSizes[this.pageSizeIndex], // 当前页大小
            tableHeight: this.height,
            
            toolsObject: {},
            validateObject: {}, // 验证对象
            selectionList: [], // 多选列表
            internalFormDialogWidth: null, // 内部的弹窗宽度 仅当操作栏按钮单独配置formDialogWidth生效
            formVisible: false, // 编辑弹窗显隐
            dialogConfirmLoading: false, // 弹窗loading
            uniqueKey: this.rowKey ? this.rowKey : '$rowKey', // 唯一键
            formReady: false, // 表单初始化状态
            formTitle: '', // 弹窗表单标题
            formConfig: {
                // 编辑表单配置
                initFields: this.initFields, // 初始化字段
                cols: this.formCols, // 一行放置的表单项数量
                eventType: null,
                currentMode: 'new', // 操作模式
                currentPanel: '', // 当前面板
                splitPanelData: this.splitPanelData, // 不同面板是否启用数据隔离
                formLabelWidth: this.formLabelWidth, // 表单标签宽度
                labelPosition: this.formLabelPosition, // 表单标签对齐方式
                formItemsCover: this.formItemsCover, // 表单项是否占满容器
                column: this.formColumn ? this.formColumn : [], // 表单项列表
                gutter: this.formGutter, // 表单项间距
                colsWidth: this.formColsWidth, // 表单项固定宽度
                disabledForm: false,
            },
        }
    },
    watch: {
        column(){
            this.initTableColumn();
        },
        loading(state){
            this.dataLoading = state;
        },
        
    },
    created(){
        /**
         * 初始化
         */
        this.initTableColumn();
        if(this.loadData){
            // 触发分页事件 获取数据
            this.reload()
        }
       
    },
    render(h){
        /**
         * 预设编辑时内容
         */
        const setEditContent = ({column, scope}) => {
            if(this.validateObject[`${column.prop}-${scope.row[this.uniqueKey]}`] === false){
                return <el-tooltip  placement="bottom" effect="light">
                       <span slot="content">{this.getValidateTips(column, scope.row)}</span>
                       {setEditControl({column, scope})}
                </el-tooltip>
            }
            return setEditControl({column, scope})
        }
        /**
         * 自定义模板渲染方法
         */
        const customTemplate = (column, scope) => {
            let template = column.template(scope);
            let type = getFieldType(column.template(scope));
            if(type === 'String' || (type === 'Object' && getFieldType(template.content) === 'String')){
                return h('span', {
                    class: `cell-text ${typeof template.emit === 'string' && 'cursor-pointer'}`,
                    on: {
                        click: () => {template.emit ? this.handleEmit({type: template.emit, scope}) : ''}
                    },
                    domProps: {
                        innerHTML: template.content ? template.content : column.template(scope)
                    }
                })
            }else{
                // console.error(`The custom template rendering method returned an incorrect value. expect[string/object] \n Example1: return '<span>${column.label}</span>' \n Example2: return {emit: 'eventType', content: '<span>${column.label}</span>'}`)
                return this.getDefaultCellValue(column, scope.row[scope.column.property]);
            }
        };
        /**
         * 预设编辑时控件
         */
        const setEditControl = ({column, scope}) => {
            if(typeof column.editRender === 'function'){
                // 自定义render渲染方法
                return column.editRender(h, scope)
            }else if(column.editType === 'input'){
                // 输入框
                return <el-input v-model={scope.row[scope.column.property]}  props={this.setControlProperty(column)} on={this.getControlEvents(column, scope)} disabled={this.setDisabledState(column, scope)} ></el-input>
            }else if(column.editType === 'select'){
                // 下拉框
                return <el-select v-model={scope.row[scope.column.property]}  props={this.setControlProperty(column)} on={this.getControlEvents(column, scope)} disabled={this.setDisabledState(column, scope)} style="width: 100%">
                {this.getOptions(column).map(opt => {
                    return <el-option 
                    label={this.getOptionsFields(column, opt, 'label')}
                    value={this.getOptionsFields(column, opt, 'value')}>
                    </el-option>
                })}
                </el-select>
            }else if(column.editType === 'date-picker'){
                // 日期选择器
                return <el-date-picker v-model={scope.row[scope.column.property]} props={this.setControlProperty(column)} on={this.getControlEvents(column, scope)} disabled={this.setDisabledState(column, scope)} style="width: 100%"></el-date-picker>
            }else if(column.editType === 'switch'){
                // 开关
                return <el-switch v-model={scope.row[scope.column.property]} props={this.setControlProperty(column)} on={this.getControlEvents(column, scope)} disabled={this.setDisabledState(column, scope)}></el-switch>
            }else if(column.editType === 'link'){
                // 链接
                return <el-link  props={this.setControlProperty(column)} on={this.getControlEvents(column, scope)} disabled={this.setDisabledState(column, scope)}>{column.linkText ? column.linkText : "链接"}</el-link>
            }else if(column.editType === 'checkbox-group'){
                // 多选框组
                return <el-checkbox-group v-model={scope.row[scope.column.property]} props={this.setControlProperty(column)} on={this.getControlEvents(column, scope)} disabled={this.setDisabledState(column, scope)}>
                    {this.getOptions(column).map(opt => {
                        return <el-checkbox label={column.optionControl?.value ? opt[column.optionControl.value] : opt[this.optionControl.value]}>
                            {column.optionControl?.label ? opt[column.optionControl.label] : opt[this.optionControl.label]}
                        </el-checkbox>
                    })}
                </el-checkbox-group>
            }else if(column.editType === 'input-number'){
                // 计数器
                return <el-input-number 
                v-model={scope.row[scope.column.property]}
                props={this.setControlProperty(column)}
                on={this.getControlEvents(column, scope)}
                disabled={this.setDisabledState(column, scope)}
                style="width: 100%"
                >
                </el-input-number>
            }else if(column.editType === 'time-picker'){
                // 时段选择器
                return <el-time-picker
                        v-model={scope.row[scope.column.property]}
                        props={this.setControlProperty(column)}
                        on={this.getControlEvents(column, scope)}
                        disabled={this.setDisabledState(column, scope)}
                        style="width: 100%">
                    </el-time-picker>
            }else if(column.editType === 'upload-button'){
                return <tp-upload-button 
                    contol={this.setControlProperty(column)} 
                    fileList={scope.row[scope.column.property]} >
                </tp-upload-button>
            }else if(typeof column.template === 'function'){
                // 编辑状态时预设控件不存在 默认的模板渲染方法同样生效
                return customTemplate(column, scope);
            }else{
                // 默认内容
                return this.getDefaultCellValue(column, scope.row[scope.column.property])
            }
        }
        /**
         * =======
         * 预设内容
        */ 
        const setDefaultContent = ({column, scope}) => {
            if(column.$edit || column.prop in this.toolsObject || `${column.prop}-${scope.row[this.uniqueKey]}` in this.toolsObject){
                return this.$scopedSlots['edit-' + column.prop] ? this.$scopedSlots['edit-' + column.prop](scope) : setEditContent({column, scope})
            }else if(typeof column.render === 'function'){
                // 自定义render渲染方法
                return column.render(h, scope)
            }else if(typeof column.template === 'function'){
                // 自定义模板渲染方法
                return customTemplate(column, scope);
            }else{
                // 默认内容
                return this.getDefaultCellValue(column, scope.row[scope.column.property])
            }
        }
        /**
         * 渲染默认表头
         */
        const setDefaultHeader = (column, scope) => {
            if(column.editColumn){
                return <el-link
                onclick={() => {this.headerClick(column, scope)}} 
                icon={scope.column.$edit ? 
                'el-icon-circle-check' : 'el-icon-edit-outline'}
                underline={scope.column.$edit === true}
                style="font-size: inherit;font-weight: bold;">
                {scope.column.label}
                </el-link>
            }else{
                return <span>
                {column.headerIcon ? <i class={column.headerIcon} style="margin-right: 4px"></i> : ''}
                {scope.column.label}
                </span>
            }
        }
        /**
         * ==============
         * column 渲染方法
         */
        const renderColumns = columns => {
            return columns.map((column, index) => {
                if(column.children){
                    return (<el-table-column width={column.width} label={column.label} align={column.align ? column.align : this.align} fixed={column.fixed} key={'mul-' + index}>
                        {renderColumns(column.children)}
                    </el-table-column>)
                }else{
                    if(['index', 'selection', 'expand'].indexOf(column.type) > -1 && this.getColumnVisible(column)){
                        // 序号
                        return <el-table-column
                            type={column.type}
                            key={column.type}
                            label={column.label}
                            align={column.align ? column.align : this.align}
                            fixed={column.fixed}
                            width={column.width}
                            index={this.getIndexMethod}
                            selectable={column.selectable}
                            reserve-selection={typeof column.reserveSelection === 'boolean' ? column.reserveSelection : this.reserveSelection}
                            {
                                ...this.getIndexSelectionExpandSlots(column.type)
                            }
                        >
                        </el-table-column>
                    }else if(this.getColumnVisible(column)){
                        return h('el-table-column', {
                            props: {
                                key: column.nodeKey ? column.nodeKey : column.prop,
                                label: column.label,
                                prop: column.prop,
                                width: column.width,
                                sortable: column.sortable, // 排序
                                'sort-method': column.sortMethod, // 排序方法
                                filters: column.filters, // 筛选
                                'filter-method': column.filterMethod, // 筛选方法
                                align: column.align ? column.align : this.align,
                                "min-width": this.getColumnMinWidth(column),
                                fixed: column.fixed,
                                'show-overflow-tooltip': column.showOverflowTooltip === false ? false : true
                            },
                            scopedSlots: {
                                header: scope => {
                                    let propName = 'header-' + column.prop;
                                    return this.$scopedSlots[propName] ? this.$scopedSlots[propName]({scope, $edit: () => {this.headerClick(column, scope)}}) : setDefaultHeader(column,scope)
                                },
                                default: scope => {
                                    if(this.getRowEditStatus(scope.row) || this.unifiedEdit){
                                        let propName = 'edit-' + column.prop;
                                        return this.$scopedSlots[propName] ? this.$scopedSlots[propName](scope) : setEditContent({column, scope})
                                    }else{
                                        let propName = 'default-' + column.prop;
                                        return this.$scopedSlots[propName] ? this.$scopedSlots[propName](scope) : setDefaultContent({column, scope})
                                    }
                                }
                            }
                        })
                    }
                    
                }
            })
        }
        /**
         * 渲染操作栏表头
         */
        const renderActionHeader = (scope, button) => {
            if(this.internalAddButtonControl.location === 'header' && this.getRenderConditions('root', scope)){
                return this.actionButtonType === 'link' ? 
                <el-link on-click={() => {this.handleNew(scope, button)}} type={this.internalAddButtonControl.type} icon={this.internalAddButtonControl.icon} size={this.actionButtonSize} key="link-root" title="新增">{this.internalAddButtonControl.text}</el-link> : 
                <el-button on-click={() => {this.handleNew(scope, button)}} icon="el-icon-plus" size={this.actionButtonSize} key="button-root" title="新增"></el-button>
            }else{
                return '操作'
            }
        }
        /**
         * 渲染按钮
         */
        const setDefaultButton = (item, scope, index) => {
            return this.actionButtonType === 'link' ? 
            <el-link on-click={() => {this.reportEvent(item, scope)}} 
                type={typeof item.type === 'function' ? (item.type(scope)) : item.type} 
                icon={this.getLinkIcon(item, scope)} 
                title={typeof item.title === 'function' ? (item.title(scope)) : item.title}
                class={typeof item.class === 'function' ? (item.class(scope)) : item.class} 
                disabled={this.setDisabledState(item, scope)} 
                underline={item.underline}
                key={this.getButtonKey(item, index)}
                size={this.actionButtonSize}>{this.setButtonText(item, scope)}</el-link> :
            <el-button on-click={() => {this.reportEvent(item, scope)}} 
                type={typeof item.type === 'function' ? (item.type(scope)) : item.type} 
                icon={typeof item.icon === 'function' ? (item.icon(scope)) : item.icon} 
                title={typeof item.title === 'function' ? (item.title(scope)) : item.title} 
                plain={typeof item.plain === 'function' ? (item.plain(scope)) : item.plain} 
                class={typeof item.class === 'function' ? (item.class(scope)) : item.class} 
                round={item.round}
                circle={item.circle}
                key={this.getButtonKey(item, index)}
                disabled={this.setDisabledState(item, scope)} 
                loading={item.target === 'save' ? this.getRowSaveLoading(scope.row) : item.target === 'delete' ? this.getRowDeleteLoading(scope.row) : false}
                size={this.actionButtonSize}>{this.setButtonText(item, scope)}</el-button>
        }
        /**
         * 渲染操作栏主体内容
         */
        const renderActionContent = scope => {
            return <div class="action-button-wrap" style={{'justify-content': this.actionAlign}}>
                {
                    this.internalBuiltInButtons.map((item, index) => {
                        if(this.builtInButtonConditions(item, scope) && this.getRenderConditions(item.target, scope)){
                            let slotName = item.target + '-button';
                            return this.$scopedSlots[slotName] ? this.$scopedSlots[slotName]({event: this[this.builtInEvent(item)], scope}) : 
                            setDefaultButton(item, scope, index)
                        }
                    })
                }
                {
                    this.internalActionButtons.map((item, index) => {
                        if(this.getRenderConditions(item.target || item.emit, scope) && (item.target ? this.builtInButtonConditions(item, scope) : true)){
                            let slotName = (item.target || item.emit) + '-button';
                            return this.$scopedSlots[slotName] ? this.$scopedSlots[slotName](item.target ? 
                            {event: this[this.builtInEvent(item)], scope} : {event: () => {event: this.reportEvent(item, scope)}, scope}) : 
                            setDefaultButton(item, scope, index)
                        }
                    })
                }
                {

                }
            </div>
        }
        /**
         * 渲染操作栏
         */
        const renderActionColumn = () => {
            if(this.$scopedSlots.action){
                // 完全自定义操作栏插槽
                return this.$scopedSlots.action(this.data);
            }else if(this.internalActionStatus){
                return <el-table-column align={this.actionAlign} fixed="right" width={this.getActionBarWidth} min-width={this.getActionBarWidth}
                    {...{
                        scopedSlots: {
                            header: scope => {
                                return this.$scopedSlots['action-header'] ? this.$scopedSlots['action-header'](scope) : renderActionHeader(scope, {actionName: '新增数据'})
                            },
                            default: scope => {
                                return this.$scopedSlots['action-content'] ? this.$scopedSlots['action-content'](scope) : renderActionContent(scope, {actionName: '新增数据'})
                            }
                        }
                    }}
                />
            }
        }
        /**
         * 渲染分页器
         */
        const renderPagination = () => {
            return <div class="pagination-wrap" style={{justifyContent: this.footer_justify}}>
                {this.$scopedSlots['pagination-left'] ? this.$scopedSlots['pagination-left']({currentPage: this.currentPage,total: this.total,currentPageSize: this.currentPageSize}) : this.$slots['pagination-left']}
                <el-pagination
                    ref="el-pagination"
                    current-page={this.currentPage}
                    page-sizes={this.pageSizes}
                    page-size={this.currentPageSize}
                    pager-count={this.pagerCount}
                    layout={this.layout}
                    total={this.getTotal}
                    small={this.smallPagination}
                    background
                    on={{
                        'size-change': this.handleSizeChange, 
                        'current-change': this.setPage,
                    }}
                ></el-pagination>
                {this.$scopedSlots['pagination-right'] ? this.$scopedSlots['pagination-right']({currentPage: this.currentPage,total: this.total,currentPageSize: this.currentPageSize}) : this.$slots['pagination-right']}
            </div>
        }
        /**
         * 追加新增按钮
         */
        const renderAddButtonInAppend = (location) => {
            return this.internalAddButtonControl.location === location && this.getRenderConditions('root') && <div class={`table-new-button-${location}${this.border && ' border' || ''}`}>
                <el-link on-click={this.handleAddButtonInAppend} type={this.internalAddButtonControl.type} icon={this.internalAddButtonControl.icon}>{this.internalAddButtonControl.text}</el-link>
            </div>
        };
        /**
         * 获取表格追加的内容 append 插槽
         */
        const getContentAppendToTable = () => {
            return this.$slots['table-append'] && this.$slots['table-append'] 
            || renderAddButtonInAppend('append');
        };
        /**
         * 渲染弹窗按钮
         */
        const renderDialogButton = () => {
            return <div slot="footer" class="dialog-footer">
                {
                    this.formDialogButton.map((item, index) => {
                        if(this.getRenderConditions(item.target || item.emit) && (item.target ? this.builtInButtonConditions(item) : true) ){
                            return <el-button on-click={() => {this.reportEvent(item, {form: this.$refs.rocForm?.form})}} 
                            type={typeof item.type === 'function' ? (item.type({form: this.$refs.rocForm?.form})) : item.type} 
                            icon={typeof item.icon === 'function' ? (item.icon({form: this.$refs.rocForm?.form})) : item.icon} 
                            title={typeof item.title === 'function' ? (item.title({form: this.$refs.rocForm?.form})) : item.title} 
                            plain={typeof item.plain === 'function' ? (item.plain({form: this.$refs.rocForm?.form})) : item.plain} 
                            class={typeof item.class === 'function' ? (item.class({form: this.$refs.rocForm?.form})) : item.class} 
                            round={item.round}
                            circle={item.circle}
                            key={this.getButtonKey(item, index)}
                            disabled={item.disabled} 
                            loading={item.target === '$update' ? this.dialogConfirmLoading : false}
                            size={this.formDialogButtonSize}>{this.setButtonText(item, this.$refs.rocForm?.form)}</el-button>
                        }
                        
                    })
                }
            </div>
        }
        /**
         * 编辑弹窗
         */
        const renderEditDialog = () => {
            return <el-dialog  
            visible={this.formVisible} 
            on={{['update:visible']: state => {this.formVisible = state}}} 
            title={this.formTitle} width={this.getFormDialogWidth} 
            append-to-body 
            before-close={this.beforeClose} 
            modal={this.formDialogModal}
            close-on-click-modal={this.closeOnClickModal} 
            class="dynamicTable-dialog">
                <DynamicForm
                    props={this.formConfig}
                    received_dicts={this.dicts}
                    attrs={this.$attrs}
                    ref="rocForm"
                    on={{created: () => {this.formReady = true}, change: this.emitDynamicFormEvents, uploadTaskEnd: this.handleUploadTaskEnd}}
                    {...{
                        scopedSlots: this.getFormSlots
                    }}
                >
                </DynamicForm>
                { this.formReady ? renderDialogButton() : ''}
            </el-dialog>
        }
        return (<div class={{'tp-dynamic-table-wrap': true, 'auto-container-height': this.autoContainerHeight}}>
            <el-table data={this.getTableData}
            ref="elTable" 
            v-loading={this.dataLoading}
            element-loading-text="正在加载，请稍后..."
            element-loading-spinner="el-icon-loading"
            border={this.border}
            stripe={this.internalStripe}
            row-key={this.uniqueKey} 
            size={this.internalTableSize}
            height={this.tableHeight}
            max-height={this.maxHeight}
            tree-props={this.treeProps}
            show-summary={this.showSummary}
            sum-text={this.sumText}
            summary-method={this.getSummaries}
            span-method={this.spanMethod}
            default-expand-all={this.defaultExpandAll}
            highlight-current-row={this.highlightCurrentRow}
            default-sort={this.defaultSort}
            cell-class-name={this.getCellClassName}
            row-class-name={this.rowClassName}
            cell-style={this.getCellStyle}
            on={{
                ...this.$listeners,
                'cell-dblclick': this.handleCellDblclick,
                'selection-change': this.handleSelectionChange
            }} 
            class={this.dynamic && (this.internalEditMode === 'inline' || this.unifiedEdit) ? 'dynamic-table' : ''}>
                {renderColumns(this.column)}{renderActionColumn()}
                <template slot="empty">{this.$slots['table-empty']}</template>
                <template slot="append">{getContentAppendToTable()}</template>
            </el-table>
            {renderAddButtonInAppend('bottom')}
            {this.pagination ? renderPagination() : ''}
            {this.dynamic && this.internalEditMode === 'window' &&  !this.unifiedEdit && renderEditDialog() || null}
        </div>)
    },
    computed: {
        /**
         * 返回表格数据
         */
        getTableData(){
            return this.virtualPage ? this.data.slice((this.currentPage - 1) * this.currentPageSize, this.currentPage * this.currentPageSize) : this.data;
        },
        /**
         * 表格数据总量
         */
        getTotal(){
            return this.virtualPage ? this.data.length : (this.data.length > this.total && this.data.length || this.total);
        },
        /**
         * 总页数
         */
        getTotalPages(){
            return Math.ceil(this.total / this.currentPageSize);
        },
        /**
         * 返回校验错误的单元格样式
         */
        getCellErrorStyle(){
            return this.errorCellBlink ? {animation: 'flicker .2s linear 5', ...this.cellErrorStyle} : this.cellErrorStyle;
        },
        /**
         * @computed getFormDialogWidth 获取弹窗宽度
         * @desc 当操作栏按钮单独配置了formDialogWidth时返回internalFormDialogWidth
         */
        getFormDialogWidth(){
            return this.internalFormDialogWidth || this.formDialogWidth || (this.$ROCTABLE || {}).formDialogWidth || '50%';
        },
        /**
         * @computed getFormSlots 获取表单插槽
         * @returns {Object.<string, Function>} 表单插槽渲染方法的集合
         */
        getFormSlots(){
            let scopedSlots = {};
            for(let i in this.$scopedSlots){
                if(i.indexOf('form-') > -1){
                    scopedSlots[i] = params => {
                        return this.$scopedSlots[i] ? this.$scopedSlots[i](params) : this.$slots[i];
                    }
                }
            }
            return scopedSlots;
        },
        /**
         * @computed getActionBarWidth 获取操作栏宽度
         * @desc 
         *   1. 操作栏单元格宽度：单元格(cell)的基础填充宽度(cellFillWidth) + 所有按钮宽度 + 所有按钮间距
         *   2. cellFillWidth：单元格(cell)基础填充宽度，为使操作栏按钮组不出现换行，cellFillWidth的最小值取决于cell单元格的左右paddig之和+1
         *   3. 按钮宽度：按钮填充宽度(padding, border) + 文本宽度 + 文本与icon间距 + 按钮与按钮的间距
         * @returns {Number} 操作栏宽度 
         */
        getActionBarWidth(){
            if(typeof this.actionBarWidth === 'number'){
              // 固定宽度
                return this.actionBarWidth
            }else if(typeof this.actionBarWidth === 'number'){
              // 自定义计算操作栏宽度的方法
              return this.actionBarWidth(this.internalActionButtons, this.internalActionBarWidthParams);
            }else{
                // 根据配置自动计算操作栏宽度
                let {cellFillWidth, iconTextSpacing, buttonSpacing} = this.internalActionBarWidthParams;
                return this.internalActionButtons.reduce((acc, item, index) => {
                  let text = item.label || this.actionButtonType === 'link' && item.title;
                  let buttonWidth = item.width 
                  || this.actionButtonExtraWidth + getTextWidth(text, this.actionButtonFontSize) + (item.icon && this.actionButtonFontSize || 0)
                  + (text && item.icon && iconTextSpacing || 0) + (index && buttonSpacing); // 图标与文字有iconTextSpacing px的margin 除了第一个按钮, 都有buttonSpacing px的margin-left
                  acc += buttonWidth;
                  return acc;
                }, cellFillWidth);
            }
        },
        
        
  },
    mounted(){
        this.addResizeListener();
        console.log(this.$refs.elTable)
    },
    beforeDestroy(){
        window.removeEventListener('resize', this.setTableHeight)
    },
    methods: {
        
        /**
         * 表头数据初始化
         */
        initTableColumn(){
            if(this.internalEditMode === 'window' && !this.unifiedEdit){
                // 弹窗编辑
                if(!this.formColumn){
                    let formColumn = [];
                    recursiveTraverse(this.column, item => {
                        if(item.formVisible !== false && !item.hasOwnProperty('children') && ['index', 'selection', 'expand'].indexOf(item.type) < 0 ){
                            formColumn.push(item)
                        }
                    })
                    this.formConfig.column = formColumn;
                }
            }else{
                // 行内编辑
            }
            this.organizeFieldsData();
        },
        /**
         * 整理字段数据
         */
        organizeFieldsData(){
            recursiveTraverse(this.column, item => {
                // propAsKeyOnly为true时, 当前prop不加入到表单
                if(item.prop && !item.propAsKeyOnly && item.columnVisible !== false){
                    if(item.prop in this.initFieldsCollection){
                        console.error(`[RocTable warn]: Duplicate prop detected: '${item.prop || item.transferProp}'. This may cause an update error`)
                        return;
                    }
                    this.initFieldsCollection[item.prop] = {
                        value: this.supportedComponents[item.editType in this.supportedComponents ? item.editType : 'unknown'],
                        label: item.label,
                        editType: item.editType,
                        required: typeof item.required  === 'boolean' ? item.required : false, // 默认字段非必传
                        validator: item.validator ? item.validator : false // 验证方法
                    };
                    
                }
                if(item.prop){
                  // 字典数据
                    if(item.dict && !(item.dict in this.dicts)){
                        this.$set(this.dicts, item.dict, null); // 首先初始化, 避免接口返回异常时表单子组件再次发起请求
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
                    }
                };

            })
        },
        handleNew(scope, button = {actionName: '新增'}){
            if(button && typeof button.premise === 'function' && !(button.premise(scope))){
                // 未通过前置条件
                return;
            };
            if(this.internalEditMode === 'window' && !this.unifiedEdit){
                // 弹窗编辑
                this.formTitle = button.actionName; // 弹窗标题
                this.internalFormDialogWidth = button.formDialogWidth; // 通过按钮单独配置的弹窗宽度
                this.formConfig.eventType = button.eventType; // 标记当前事件类型
                this.formConfig.currentMode = 'new'; // 标记当前操作模式 (new/update/view)
                this.formConfig.currentPanel = button.panel; // 设置表单的当前面板
                this.formConfig.disabledForm = false; 
                this.formConfig.cols = button.formCols || this.formCols; 
                
                this.currentEditRow = scope && scope.row ? scope.row : null;
                if(typeof button.getFormData === 'function'){
                    button.getFormData({row: this.currentEditRow, $row: this.currentEditRow ? this.getMappingData(this.currentEditRow) : null, callBack: data => {
                        this.formVisible = true;
                        this.$nextTick(() => {
                            this.setRocForm(data);
                        })
                    }} )
                }else{
                    this.formVisible = true;
                    let isInternalEvent = scope && scope.column && scope.store && scope._self && scope.hasOwnProperty('$index'); // 判断是否由组件触发
                    if(!isInternalEvent && getFieldType(scope) === 'Object'){
                        this.$nextTick(() => {
                            this.setRocForm(scope);
                        })
                    }
                }
            }else{
                // 行内编辑
                let newRow = {};
                for(let i in this.initFieldsCollection){
                    newRow[i] = this.initFieldsCollection[i].value;
                };
                // 当使用自定义模板 创建了非 一对一 管理的表格时 可以传入initFields 指定初始化数据 否则将造成新增错误!
                // 合并初始化数据字段
                let isInternalEvent = scope && scope.column && scope.store && scope._self && scope.hasOwnProperty('$index');
                newRow = Object.assign(newRow, deepClone(isInternalEvent ? this.initFields : Object.assign(deepClone(this.initFields), scope)))
                newRow[this.uniqueKey] = getId();
                if(scope && scope.row){
                    // children子集新增
                    newRow.parent = {};
                    for(let i in scope.row){
                        if(i !== 'children'){
                            newRow.parent[i] = deepClone(scope.row[i]);
                        }
                    };
                    let backupRow = deepClone(newRow);
                    backupRow.$new = true; // 标记为新增数据
                    backupRow.$edit = true; // 默认开启编辑
                    backupRow.$saveLoading = false; // 保存按钮loading
                    this.$set(this.backupTableData, newRow[this.uniqueKey], backupRow);
                    if(scope.row.children){
                        // 新增数据行
                        scope.row.children[this.internalInsertDataMethod](newRow);
                    }else{
                        this.$set(scope.row, 'children',  [newRow]);
                    };
                    this.$nextTick(() => {
                        this.$refs.elTable.toggleRowExpansion(scope.row, true)
                    })
                }else{
                    // 根节点新增
                    let backupRow = deepClone(newRow);
                    backupRow.$new = true; // 标记为新增数据
                    backupRow.$edit = true; // 默认开启编辑
                    backupRow.$saveLoading = false; // 保存按钮loading
                    this.$set(this.backupTableData, newRow[this.uniqueKey], backupRow);
                    this.data[this.internalInsertDataMethod](newRow);
                    if(this.virtualPage){
                        this.$emit('update:total', this.data.length);
                        if(this.data.length > this.currentPageSize){
                            this.setPage(getPageNumber(this.data.length, this.currentPageSize))
                        }
                    };
                    this.$nextTick(() => {
                        let element = this.$refs.elTable.$refs.bodyWrapper;
                        element.scrollTop = this.internalInsertDataMethod === 'push' && element.scrollHeight || 0;
                    })
                };
            }
        },
        /**
         * 定位到指定位置的数据
         */
        // locateTheDataByIndex(rootIndex, property){
        //     let targetData = null;
        //     let indexList = rootIndex.split('-');
        //     indexList.some((item, index) => {
        //         // 树形数据 定位源数据位置
        //         let targetIndex = Number(item);
        //         targetData = index === 0 ? this[property][targetIndex] : targetData.children[targetIndex];
        //     });
        //     return targetData;
        // },
        handleEdit(scope, button = {actionName: '编辑'}){
            if(typeof button.premise === 'function' && !(button.premise(scope))){
                // 未通过前置条件
                return;
            };
            let row = scope.row;
            if(this.internalEditMode === 'inline'){
                // 行内编辑
                this.setMappingData(row, {'$edit': true}, true); // 第三个参数为true, 编辑时需更新映射数据
            }else{
                // 弹窗表单编辑
                this.currentEditRow = row; // 标记当前编辑行
                this.internalFormDialogWidth = button.formDialogWidth; // 通过按钮单独配置的弹窗宽度
                this.formConfig.eventType = button.eventType; // 标记当前事件类型
                this.formConfig.currentMode = 'update'; // 标记当前操作模式
                this.formTitle = button.actionName || button.label; // 操作名称
                this.formConfig.disabledForm = false; 
                this.formConfig.currentPanel = button.panel; // 设置表单的当前面板
                if(typeof button.getFormData === 'function'){
                    button.getFormData({row, callBack: data => {
                        this.formVisible = true;
                        this.$nextTick(() => {
                            this.setRocForm(data);
                        })
                    }})
                }else{
                    this.formVisible = true;
                    this.$nextTick(() => {
                        this.setRocForm(deepClone(row));
                    })
                }
            };
            // 内置事件存在emit时, 一同触发
            if(button.emit){
                this.handleEmit({type: button.emit, row, $row: this.getMappingData(row)})
            }
        },
        /**
         * 更新动态表单字段值
         */
        setRocForm(row){
            this.$refs.rocForm.updateFields(row)
        },
        /**
         * 删除数据
         */
        async handleDelete(scope, button){
            if(typeof button.premise === 'function' && !(await button.premise(scope))){
                // 未通过前置条件
                return;
            };
            if(this.confirmBeforeDelete){
                // 二次确认
                this.setMappingData(scope.row, {'$deleteLoading': true});
                this.$confirm(`确认要删除此条数据吗?`, '确认删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    lockScroll: false,
                    type: 'warning',
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '进行中...';
                            const success = info => {
                                this.executeDeleteBefore(scope);
                                instance.confirmButtonLoading = false;
                                done();
                                this.executePromp(info, {type:'success', message: info ? info : '删除成功！'})
                            };
                            const fail = info => {
                                this.setMappingData(scope.row, {'$deleteLoading': false})
                                instance.confirmButtonLoading = false;
                                done();
                                this.executePromp(info, {type:'error', message: info ? info : '删除失败！'})
                            };
                            this.handleEmit({type: 'delete', row: scope.row, $row: this.getMappingData(scope.row), success, fail })
                        }else{
                            if(instance.confirmButtonLoading){
                                this.$message.info("删除任务进行中，请稍后...")
                            }else{
                                this.setMappingData(scope.row, {'$deleteLoading': false})
                                this.$message({
                                    type: 'info',
                                    message : '已取消！'
                                }) 
                                done()
                            }
                        }
                    }
                })
            }else{
                // 立即移除
                this.handleEmit({type: 'deleted', row: scope.row});
                this.executeDelete(scope);
            }
            
        },
        /**
         * 批量删除
         */
        handleBatchDelete(){
            if(!this.selectionList.length){
                this.$message.info("请先选中要删除的数据！");
                return;
            }
            if(this.confirmBeforeDelete){
                // 删除前确认
                this.$confirm(`确认删除选中的${this.selectionList.length}条数据吗?`, '确认删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    lockScroll: false, // 解决页面抖动
                    type: 'warning',
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            this.setTableLoading(true);
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '进行中...';
                            const success = info => {
                                this.executeDeleteBefore();
                                this.setTableLoading(false);
                                instance.confirmButtonLoading = false;
                                done();
                                this.executePromp(info, {type:'success', message: info ? info : '删除成功！'})
                            };
                            const fail = info => {
                                this.setTableLoading(false);
                                instance.confirmButtonLoading = false;
                                done();
                                this.executePromp(info, {type:'error', message: info ? info : '删除失败！'})
                            };
                            this.handleEmit({type: 'delete', selection: this.selectionList, success, fail });
                        }else{
                            if(instance.confirmButtonLoading){
                                this.$message.info("删除任务进行中，请稍后...")
                            }else{
                                this.$message({
                                    type: 'info',
                                    message : '已取消！'
                                }) 
                                done()
                            }
                        }
                    }
                })
            }else{
                // 立即移除
                this.handleEmit({type: 'deleted', selection: this.selectionList});
                this.executeBatchDelete(this.selectionList);
            }
            
        },
        executeDeleteBefore(scope){
            if(!this.virtualPage && this.internalRefreshTableOnSuccess.delete){
                if(!scope && this.data.length === 1 && this.currentPage > 1 && this.currentPage === this.getTotalPages){
                    // 当分页总数大于1,并且当前页为最末页时, 最后一项移除时，自动翻到上一页
                    this.setPage(this.currentPage - 1)
                }else if(this.selectionList.length ===  this.data.length && this.currentPage > 1 && this.currentPage === this.getTotalPages){
                    // 当分页总数大于1，并且当前页为最末页时，批量删除的数量刚好等于当页数量时回到上一页
                    this.setPage(this.currentPage - 1)
                }else if(this.selectionList.length > this.data.length){
                    this.setPage(1); // 多页批量删除时回到第一页
                }else{
                    this.emitPageChange(); // 刷新
                }
            }else{
                // 不刷新列表, 直接删除
                if(scope && scope.row){
                    this.executeDelete(scope);
                }else{
                    this.executeBatchDelete(this.selectionList);
                }
                
            };
        },
        handleView(scope, button){
            if(typeof button.premise === 'function' && !(button.premise(scope))){
                // 未通过前置条件
                return;
            };
            let row = scope.row;
            this.formConfig.eventType = button.eventType; // 标记当前事件类型
            this.formConfig.currentMode = 'view'; // 标记操作模式
            this.formTitle = button.actionName || '查看';
            this.formConfig.disabledForm = true;
            this.formConfig.currentPanel = button.panel; // 设置表单的当前面板
            this.formVisible = true;
            this.$nextTick(() => {
                this.setRocForm(deepClone(row));
            })
        },
        /**
         * 保存
         */
        handleSave(scope){
            let $row = this.getMappingData(scope.row);
            let mode = $row.$new ? 'new' : 'update';
            const success = (info) => {
                $row.$saveLoading = false;
                $row.$new = false;
                $row.$edit = false;
                let infoType = getFieldType(info);
                if(infoType === 'Object'){
                    // 对象 直接更新当前行
                    for(let i in info){
                        scope.row[i] = info[i];
                    }
                }else if(this.internalRefreshTableOnSuccess[mode]){
                    this.emitPageChange(); // 刷新当前页
                };
                this.executePromp(info, {type:'success', message : '数据已更新！'})
            };
            const fail = (info) => {
                $row.$saveLoading = false;
                this.executePromp(info, {type:'error', message: info ? info : '更新失败！'})
            };
            $row.$saveLoading = true;
            // 校验
            let checkRow = true;
           
            for(let i in this.initFieldsCollection){
                let checkResult = this.checkRequireFields({key: i, row: scope.row}); // 验证结果
                if(checkResult.result){
                    // 通过
                    if(this.validateObject[`${i}-${scope.row[this.uniqueKey]}`] === false){
                        this.$delete(this.validateObject, `${i}-${scope.row[this.uniqueKey]}`); // 移除验证标记
                    }
                }else{
                    // 未通过
                    checkRow = false;
                    this.$nextTick(() => {
                        this.$set(this.validateObject, `${i}-${scope.row[this.uniqueKey]}`, false); // 标记验证失败
                    })
                    
                }
            };
            if(checkRow){
                this.handleEmit({type: $row.$new ? 'new' : 'update', row: scope.row, $row, scope, success, fail })
            }else{
                // 验证失败 恢复当前行状态
                $row.$saveLoading = false;
                this.$message.error('校验失败的字段已被标记！请检查后再试')
            }
        },
        /**
         * 取消编辑 重置控件值
         */
        handleCancel(scope){
            let $row = this.getMappingData(scope.row);
            if($row.$new){
                this.executeDelete(scope);
            }else{
              for(let i in scope.row){
                scope.row[i] = deepClone($row[i])
              };
              $row.$edit = false;
            }
        },
        /**
         * 分页器分页条数改变事件
         * @val 当前分页大小
         */
        handleSizeChange(val){
            if(this.virtualPage){
                this.currentPageSize = val;
            }else{
                this.setTableLoading(true);
                // 重新选择分页大小时重置当前页码到1
                this.emitPageChange({page: 1, pageSize: val});
            }
        },
        /**
         * 分页器当前页码改变事件
         * @val 当前页码
         */
        setPage(val){
            if(this.virtualPage){
                this.currentPage = val;
            }else{
                this.setTableLoading(true);
                this.emitPageChange({page: val});
            }
        },
        /**
         * 刷新当前页 reset todo
         */
        reload(query, reset){
            this.setTableLoading(true);
            this.emitPageChange({query: deepClone(query)});
        },
        /**
         * 设置表格数据加载loading
         */
        setTableLoading(state){
            if(this.loading){
                this.$emit('update:loading', state);
            }else{
                this.dataLoading = state;
            }
        },
        /**
         * 行内编辑 检查字段
         */
        checkRequireFields({key, row}){
            // key: 当前列的prop值 | row: 当前行数据
            let value = row[key];
            let field = this.initFieldsCollection[key];
            if(field.required && (value === "" || value === null || value === undefined)){
                // 必传字段不能为空
                return {
                    result: false,
                    info: `${field.label}不能为空！`
                };
            }
            if(field.validator){
                const checkFunc = {
                    "object": () => {
                        // 正则
                        try{
                            let reg = field.validator;
                            let result = reg.test(value);
                            return {
                                result,
                                info: result ? '验证通过' : `${field.label}验证不通过！`
                            }
                        }catch(error){
                            return {
                                result: false,
                                info: '未知的验证错误，请检查验证方法或正则是否有误！'
                            }
                        }
                    },
                    "function": () => {
                        // 返回当前参数值
                        let result = field.validator({value, row});
                        return {
                            result,
                            info: result ? '验证通过' : `${field.label}验证不通过！`
                        }
                    },
                    "boolean": () => {
                        return {  // 不验证
                            result: true,
                            info: '不验证'
                        } 
                    },
                    "unknown": () => {
                        return {  // 不验证
                            result: true,
                            info: '不验证'
                        } 
                    }
                }
                let type = typeof field.validator;
                type = (type in checkFunc) ? type : 'unknown';
                return checkFunc[type]();
            };
            return {
                result: true,
                info: '通过'
            };
        },
        /**
         * 删除本地数据 并更新备份
         */
        executeDelete({row}){
            recursiveTraverseBySome(this.data, (item, index, parent) => {
                if(parent && item[this.uniqueKey] === row[this.uniqueKey]){
                    parent.children.splice(index, 1)
                    delete this.backupTableData[item[this.uniqueKey]];
                    return true;
                }else if(item[this.uniqueKey] === row[this.uniqueKey]){
                    this.data.splice(index, 1)
                    delete this.backupTableData[item[this.uniqueKey]];
                    return true;
                }
            });

            if(this.virtualPage){
                this.getTableData.length === 0 && this.currentPage > 1 && this.setPage(this.currentPage - 1)
                this.$emit('update:total', this.data.length);
            }
        },
        /**
         * 批量删除本地数据 并更新备份
         */
        executeBatchDelete(list = this.selectionList){
            let keys = list.map(item => item[this.uniqueKey]);
            keys.forEach(key => {
                delete this.backupTableData[key]; // 删除备份数据
                recursiveTraverseBySome(this.data, (item, index, parent) => {
                    if(parent && item[this.uniqueKey] === key){
                        parent.children.splice(index, 1);
                        delete this.backupTableData[item[this.uniqueKey]];
                        return true;
                    }else if(item[this.uniqueKey] === key){
                        this.data.splice(index, 1);
                        delete this.backupTableData[item[this.uniqueKey]];
                        return true;
                    }
                })
            })
            this.selectionList.length && this.$refs.elTable.clearSelection();
            if(this.virtualPage){
                // todo 批量删除时有潜在问题
                this.getTableData.length === 0 && this.currentPage > 1 && this.setPage(this.currentPage - 1)
                this.$emit('update:total', this.data.length);
            }
        },
        /**
         * 上报分页器事件
         */
        emitPageChange({page, pageSize, query} = {}){
            const success = info => {
                page && (this.currentPage = page);
                pageSize && (this.currentPageSize = pageSize);
                this.setTableLoading(false);
            };
            const fail = info => {
                this.$refs['el-pagination'].internalCurrentPage = this.currentPage;
                this.$refs['el-pagination'].internalPageSize = this.currentPageSize;
                this.setTableLoading(false);
                this.executePromp(info,{
                    type: 'error',
                    message: info ? info : '刷新表格数据失败！',
                })
            };
            this.handleEmit({
                type: 'pageChange',
                currentPage: page || this.currentPage,
                currentPageSize: pageSize || this.currentPageSize,
                query: getFieldType(query) === 'Object' && Object.assign(this.queryForPage, query) || query,
                success,
                fail,
                
            })
        },
         /**
         * 设置预置控件的禁用状态
         */
        setDisabledState(column, scope){
            let $row = this.getMappingData(scope.row);
            return $row.$saveLoading || $row.$deleteLoading || (typeof column.disabled === 'function' ? column.disabled(scope.row) : false)
        },
        /**
         * 动态设置按钮label 
         * @item 按钮配置项
         * @scope 当前数据行
         */
        setButtonText(item, scope){
            if(item.label){
                let type = typeof item.label;
                return type === 'string' ? item.label : type === 'function' ? item.label(scope) : '';
            }else if(this.actionButtonType === 'link'){
                return item.title || item.target || item.emit;
            }
        },
        /**
         * 返回内置事件名
         */
        builtInEvent(item){
            let target = {
                new: 'handleNew',
                update: 'handleEdit',
                delete: 'handleDelete',
                view: 'handleView',
                save: 'handleSave',
                cancel: 'handleCancel',
                // 表单弹窗事件
                $update: 'dialogConfirm',
                $cancel: 'resetFormOnClose',
                $close: 'resetFormOnClose',
            };
            return item.target in target ? target[item.target] : 'unknownMethod'
        },
        unknownMethod(){
            this.$message.error("未知的调用方法！")
        },
        /**
         * 触发内置事件或将事件类型上报
         * @trigger 触发事件的按钮配置
         * @scope 当前数据行
         */
        reportEvent(trigger, scope){
            if(trigger.target){
                this[this.builtInEvent(trigger)](scope, trigger);
            }else if(trigger.emit){
                // 表单触发
                if(scope.form){
                    this.handleEmit({type: trigger.emit, trigger, scope, cancel: this.resetFormOnClose, save: this.dialogConfirm, reload: this.reload})
                }else{
                    this.handleEmit({type: trigger.emit, trigger, scope, row: scope.row, $row: this.getMappingData(scope.row), reload: this.reload})
                }
                
            }  
        },
        /**
         * 内置功能按钮基本渲染条件
         */
        builtInButtonConditions(item, scope){
            let execute = null;
            if(scope){
                // 行内编辑
                let target = this.getMappingData(scope.row); // 映射目标数据
                execute = {
                    new: (!this.unifiedEdit && !target.$new && !target.$edit) || this.unifiedEdit,
                    update: !target.$edit && !this.unifiedEdit,
                    delete: (!target.$new && !target.$edit) || this.unifiedEdit,
                    view: this.internalEditMode === 'window' && !this.unifiedEdit && !target.$new && !target.$edit,
                    save: target.$edit && !this.unifiedEdit,
                    remove: target.$new && !this.unifiedEdit,
                    cancel: target.$edit && !this.unifiedEdit,
                };
            }else{
                // 表单弹窗 this.$refs.rocForm?.form
                execute = {
                    ///// 表单弹窗控制属性
                    $update: this.formConfig.currentMode === 'update' || this.formConfig.currentMode === 'new',
                    $cancel: this.formConfig.currentMode === 'update' || this.formConfig.currentMode === 'new',
                    $close: this.formConfig.currentMode === 'view'
                };
            }
            return item.target in execute ? execute[item.target] : false;
        },
        /**
         * 获取按钮的渲染条件
         * @type 按钮唯一键
         * @scope 当前数据行
         */
        getRenderConditions(type, scope){
            if(this.internalAccessControl.hasOwnProperty(type)){
                let target = this.internalAccessControl[type];
                let validateType = typeof target;
                let executeFunc = {
                    string: () => {
                        return scope.row[target] === true || scope.row[target] == '1' || (Array.isArray(scope.row[target]) && scope.row[target].length > 0);
                    },
                    boolean: () => {
                        return target;
                    },
                    function: () => {
                        try{
                            return target(scope);
                        }catch(error){
                            return false;
                        }
                    }
                };
                return executeFunc[validateType]();
            }else{
                // 没有控制 默认为true
                return true;
            };
        },
        /**
         * 内置信息提示
         */
        executePromp(info, msg){
            if(info === null){
                return;
            }
            if(info !== undefined || this.internalPrompt){
                this.$message(msg);
            }
        },
        /**
         * 表单关闭前清除验证
         */
        beforeClose(done){
            if(this.formConfig.currentMode === 'update'){
                // 如果是编辑数据则在关闭时重置表单
                setTimeout(() => {
                    this.$refs.rocForm.resetFields(true) // 重置表单
                },200)
            }else{
                this.$refs.rocForm.clearValidate(); // 清空校验信息
            }
            done()
        },
        /**
         * 编辑弹窗确认dialogConfirm
         */
        dialogConfirm(){
            this.$refs.rocForm.validate(({valid, form}) => {
                if(valid){
                    if(this.handelUploadFiles(form)){
                        // 检查是否存在需要上传的文件
                        return;
                    };
                    const success = info => {
                        if(this.internalRefreshTableOnSuccess[this.formConfig.currentMode]){
                            this.emitPageChange() // 刷新当前页
                        }else{
                            this.saveFormDataToTable(form)
                        };
                        this.resetFormOnClose(); // 关闭并重置表单
                        this.executePromp(info, {type: 'success', message: info ? info : `${this.formConfig.currentMode === 'new' ? '新增': '更新'}数据成功！`})
                    };
                    const fail = info => {
                        this.executePromp(info, {type: 'error', message: info ? info : `${this.formConfig.currentMode === 'new' ? '新增': '更新'}数据失败！`})
                        this.dialogConfirmLoading = false;
                    }
                    this.dialogConfirmLoading = true;
                    let row = deepClone(form);
                    if(this.formConfig.currentMode === 'new' && this.currentEditRow){
                        row.parent = deepClone(this.currentEditRow);
                    }
                    let type = this.formConfig.eventType || this.formConfig.currentMode; // 注释：新增了事件类型
                    this.handleEmit({type, row, form, panel: this.formConfig.currentPanel, rocTable: this, success, fail})
                }else{

                }
            })
        },
        /**
         * 检查是否存在需要上传的文件
         */
        handelUploadFiles(form){
            let tasks = 0;
            this.column.forEach(item => {
                if(['upload-image', 'test'].indexOf(item.editType) > -1 ){
                    let refName = `${item.editType}-${item.prop}`;
                    if(this.$refs.rocForm.isAutoUpload(refName) && this.findReadyFile(form[item.prop])){
                        tasks++;
                        this.$refs.rocForm.submitUpload(refName)
                    }
                }
            });
            return tasks;
        },
        /**
         * 是否存在未上传的文件
         */
        findReadyFile(arr){
            return arr.some(item => item.status === 'ready')
        },
        /**
         * 关闭弹窗时重置表单
         */
        resetFormOnClose(){
            this.dialogConfirmLoading = false;
            this.formVisible = false;
            setTimeout(() => {
                this.$refs.rocForm.resetFields(true);
            }, 200)
        },
        /**
         * 关闭弹窗
         */
        closeDialog(resetForm){
            this.dialogConfirmLoading = false;
            this.formVisible = false;
            if(resetForm){
                setTimeout(() => {
                    this.$refs.rocForm.resetFields(true);
                }, 200)
            }
        },
        /**
         * 表头双击事件
         */
        headerClick(column, scope){
            if(scope.column.$edit){
                let checkResult = true;
                this.data.forEach(row => {
                    let check = this.checkRequireFields({key: column.prop, row}); // 验证结果
                    if(check.result){
                        // 通过
                        if(this.validateObject[`${column.prop}-${row[this.uniqueKey]}`] === false){
                            this.$delete(this.validateObject, `${column.prop}-${row[this.uniqueKey]}`);
                        }
                    }else{
                        // 未通过
                        checkResult = false;
                        this.$set(this.validateObject, `${column.prop}-${row[this.uniqueKey]}`, false);
                    }
                })
                if(checkResult){
                    // console.time("close");
                    this.$set(scope.column, '$edit', false)
                    this.$delete(this.toolsObject, column.prop)
                   
                    // this.$nextTick(() => {
                    //     console.timeEnd("close")
                    // })
                }else{
                    this.$message.error("保存校验失败，请检查纠正后再试！")
                }
                
            }else{
                console.time("edit");
                this.$set(scope.column, '$edit', true)
                this.$set(this.toolsObject, column.prop, true)
                    this.$nextTick(() => {
                        console.timeEnd("edit")
                    })
                
            }
        },
        /**
         * 保存表单数据到表格 本地更新
         */
        saveFormDataToTable(form){
            // 本地更新
            if(this.formConfig.currentMode === 'new'){
                let copyForm = deepClone(form);
                copyForm[this.uniqueKey] = getId(); // 随机id
                if(this.currentEditRow){
                    // children
                    if(this.currentEditRow.children){
                        this.currentEditRow.children[this.internalInsertDataMethod](copyForm)
                    }else{
                        // 无children
                        this.$set(this.currentEditRow, 'children', [copyForm])
                    };
                    this.$nextTick(() => {
                        this.$refs.elTable.toggleRowExpansion(this.currentEditRow, true)
                    })
                }else{
                    this.data[this.internalInsertDataMethod](copyForm)
                }
            }else{
                // 更新当前行数据
                let data = deepClone(form);
                for(let i in data){
                    this.currentEditRow[i] = deepClone(data[i]);
                };
            }
            this.formVisible = false;
            // this.$refs.rocForm.resetFields(); // 确认后重置表单
        },
        /**
         * 获取表格默认展示值
         */
        getDefaultCellValue(column, value){
            if(column.editType === 'time-picker' && Array.isArray(value) && value.length){
                // 时间选择器
                return dateFormat(value[0], 'HH:MM:SS') + '~' + dateFormat(value[1], 'HH:MM:SS');
            }else if(column.dict){
                // 系统字典
                let arr = this.dicts[column.dict] ? this.dicts[column.dict] : [];
                let values = Array.isArray(value) ? value : [value]; // 绑定值
                let label = [];
                values.forEach(val=> {
                    let target = arr.find(item => item['dictValue'] == val);
                    label.push(target ? target['dictLabel'] : '/')
                })
                return label.length ? label.join(',') : '/';
            }else if(['select', 'checkbox-group'].indexOf(column.editType) > -1){
                let arr = this.dicts[column.dict] || this.$attrs[column.optionsKey] || column.options || [];
                let values = Array.isArray(value) ? value : [value]; // 绑定值
                const label = values.map(val => {
                    const target = arr.find(item => item[column.optionControl?.value ? column.optionControl.value : this.optionControl.value] === val);
                    return target ? target[column.optionControl?.label ? column.optionControl.label : this.optionControl.label] : '/';
                });
                return label.length ? label.join(',') : '/';
            }else if(['upload-button', 'upload-image'].indexOf(column.editType) > -1 && Array.isArray(value)){
                const label = value.map(item => item.name || item.raw?.name);
                return label.length ? label.join(',') : '/';
            }else if(Array.isArray(value)){
                // 当值为对象数组时,elTable对数据进行了未知的特殊处理导致了其他bug,此处直接返回字符串
                return '[object Array]';
            }else{
                return value;
            }
        },
        /**
         * 检查字段类型是否符合控件期望
         */
        checkExpectFieldsType(data){
            // 解决编辑控件期望的绑定值与实际值类型不一致时报错的问题
            if(this.column.length){
                if(getFieldType(data) === 'Object'){
                for(let i in this.initFieldsCollection){
                        if(Array.isArray(this.supportedComponents[this.initFieldsCollection[i]?.editType]) && !Array.isArray(data[i])){
                            data[i] = []; // 当控件期望绑定值为数组 实际绑定值不符时会引起报错 此处重置为空数组
                        }
                    } 
                }else if(getFieldType(data) === 'Array'){
                    data.forEach(item => {
                        this.checkExpectFieldsType(item)
                    })
                }
            }else{
                this.$message.error('表格字段数据尚未初始化, 暂无法校正字段类型!')
            }
            
        },
        /**
         * 传递表单emit的事件
         */
        emitDynamicFormEvents(events){
            this.$emit('change', events)
        },
        /**
         * 检查并返回表格数据
         */
        checkTableData(){
           // 数据校验
            let finalResult = true;
            recursiveTraverse(this.data, (item, index, parent) => {
                for(let i in this.initFieldsCollection){
                    let checkResult = this.checkRequireFields({key: i, row: item}); // 验证结果
                    if(checkResult.result){
                       this.$delete(this.validateObject, `${i}-${item[this.uniqueKey]}`)
                    }else{
                        // 校验失败 框选标记出该字段位置
                        finalResult = false;
                        this.$set(this.validateObject, `${i}-${item[this.uniqueKey]}`, false)
                    }
                };
                
            })
            if(finalResult){
                // checkTableData方法返回的数据默认经过深拷贝
                let sendData = deepClone(this.data);
                return sendData;
            }else{
                !this.isFormComponent && this.$message.error('表格数据校验失败，请检查完善后再试！')
                return false;
            }
        },
        /**
         * 处理单元格双击事件
         */
        handleCellDblclick(row, column, cell, event){
            if(this.$listeners['cell-dblclick']){
                // 自定义单元格双击事件
                this.$listeners['cell-dblclick'](row, column, cell, event)
            }
            if(this.dblClickToEditCell && column.property){
                // 双击编辑单元格
                if(this.toolsObject[`${column.property}-${row[this.uniqueKey]}`]){
                    let check = this.checkRequireFields({key: column.property, row}); // 验证结果
                    if(check.result){
                        this.$delete(this.validateObject, `${column.property}-${row[this.uniqueKey]}`);
                        this.$delete(this.toolsObject, `${column.property}-${row[this.uniqueKey]}`)
                    }else{
                        this.$set(this.validateObject, `${column.property}-${row[this.uniqueKey]}`, false)
                        this.$message.error("校验失败，请检查完善后再试！")
                    }
                    
                }else{
                    this.$set(this.toolsObject, `${column.property}-${row[this.uniqueKey]}`, true)
                }
            }
        },
        handleSelectionChange(selection){
            this.selectionList = selection;
            if(this.$listeners['selection-change']){
                this.$listeners['selection-change'](selection)
            }
        },
        /**
         * 组件上传任务结束
         */
        handleUploadTaskEnd(params){
            if(!params.error){
                this.dialogConfirm();
            }
        },
        /**
         * 关闭表格编辑状态
         */
        // closeTableEditStatusCell(){
        //     this.data.forEach(item => {
        //         if(item.$edit){
        //             item.$edit = false
        //         }
        //     });
        //     this.toolsObject = {};
        // },
        /**
         * 获取字典数据
         */
        getDict(prop){
            return this.dicts[prop];
        },
        /**
         * 处理触发事件
         */
        handleEmit(params){
            if(this.integrateAllEventsIntoTheEmitNamedChange){
                this.$emit('change', params);
            }else{
                this.$emit(params.type, params);
            }
        },
        /**
         * 处理append插槽位置上的新增事件
         */
        handleAddButtonInAppend(){
            let emit = this.internalAddButtonControl.emit;
            if(emit){
                this.handleEmit({type: emit, add: this.handleNew})
            }else{
                this.handleNew();
            }
        },
        /**
         * 获取数据行的编辑状态
         */
        getRowEditStatus(row) {
            return this.backupTableData[row[this.uniqueKey]] && this.backupTableData[row[this.uniqueKey]].$edit;
        },
        /**
         * 获取数据行的保存loading
         */
        getRowSaveLoading(row) {
            return this.backupTableData[row[this.uniqueKey]] && this.backupTableData[row[this.uniqueKey]].$saveLoading;
        },
        /**
         * 获取数据行的删除loading
         */
        getRowDeleteLoading(row) {
            return this.backupTableData[row[this.uniqueKey]] && this.backupTableData[row[this.uniqueKey]].$deleteLoading;
        },
        // 获取映射数据
        getMappingData(row) {
            !row[this.uniqueKey] && (row[this.uniqueKey] = getId()); 
            if(!this.backupTableData[row[this.uniqueKey]]){
                let backupRow = deepClone(row);
                backupRow.$edit = false;
                backupRow.$new = false;
                backupRow.$saveLoading = false;
                backupRow.$deleteLoading = false;
                this.$set(this.backupTableData, row[this.uniqueKey], backupRow)
            }
            return this.backupTableData[row[this.uniqueKey]];
        },
        /**
         * 更新映射数据
         */
        setMappingData(row, setting, updateRow){
            let target = this.getMappingData(row);
            for(let i in setting){
                if(i in target){
                    target[i] = setting[i];
                }else{
                    this.$set(target, i, setting[i]);
                }
            };
            if(updateRow){
                for(let i in row){
                    target[i] = row[i];
                }
            }
            
        },
        /**
         * 获取expand, index, selection插槽
         */
        getIndexSelectionExpandSlots(type){
            let scopedSlots = {};
            if(this.$scopedSlots[type] || this.$slots[type]){
                scopedSlots =  {
                    scopedSlots: {
                        default: scope => {
                            return this.$scopedSlots[type](scope) || this.$slots[type]
                        }
                    }
                }
            };
            return scopedSlots;
        },
        /**
         * 获取按钮key值
         */
        getButtonKey(item, index){
            return (item.target || item.emit) + index;
        },
        /**
         * 获取link按钮icon
         */
        getLinkIcon(item, scope){
            return item.target === 'save' && this.getRowSaveLoading(scope.row) && 'el-icon-loading' 
            || item.target === 'delete' && this.getRowDeleteLoading(scope.row) && 'el-icon-loading' || typeof item.icon === 'function' && (item.icon(scope)) 
            || item.icon;
        },
        /**
         * 获取表格下标
         */
        getIndexMethod(index){
            index++;
            return this.indexSortBy === 'absolute' ? (this.currentPage - 1) * this.currentPageSize + index : index;
        },
        /**
         * 获取column最小宽度
         */
        getColumnMinWidth(item){
            let {minWidth, label, autoMinWidth} = item;
            if(minWidth){
                return minWidth
            }else if(autoMinWidth === true && label){
                // 自动最小宽度
                return 20 + label.length * 13 + (item.sortable ? 24 : 0) + (item.filters ? 12 : 0)
            }
            return undefined;
        },
        /**
         * 获取表格数据项渲染条件
         */
        getColumnVisible(item){
            let type = typeof item.columnVisible;
            return type === 'boolean' ? item.columnVisible : (type === 'function' ? item.columnVisible() : true);
        },
        /**
         * 返回单元格样式
         */
        getCellStyle({row,column, rowIndex, columnIndex}){
            return this.validateObject[`${column.property}-${row[this.uniqueKey]}`] === false ? this.getCellErrorStyle : {};
        },
        /**
         * 返回单元格class todo
         */
        getCellClassName({row,column, rowIndex, columnIndex}){
            let obj = {
                'is-error__cell': this.validateObject[`${column.property}-${row[this.uniqueKey]}`] === false, 
                'is-edit__cell': this.unifiedEdit || this.getRowEditStatus(row)
            }
            return Object.keys(obj).filter(key => obj[key]).join(' ');
        },
        /**
         * 返回验证提示
         */
        getValidateTips(column, row){
            if(column.required && isEmpty(row[column.prop])){
                return <span><i class="el-icon-warning-outline" style="margin-right: 4px"></i>{`${column.label}不能为空`}</span>
            }else if(column.validator && !isEmpty(row[column.prop]) ){
                let result = this.checkRequireFields({key: column.prop, row});
                if(result.result){
                    return <span><i class="el-icon-circle-check" style="margin-right: 4px"></i>校验通过</span>;
                }else{
                    return <span><i class="el-icon-circle-close" style="margin-right: 4px"></i>{column.validateTips ? column.validateTips : '校验失败!'}</span> 
                }
            }else{
                return <span><i class="el-icon-circle-check" style="margin-right: 4px"></i>校验通过</span> 
            }
        },
        /**
         * 获取控件绑定事件
         */
        getControlEvents(column, scope){
            let controlEvents = {};
            if(typeof column.controlEvents === 'object'){
                for(let i in column.controlEvents){
                    controlEvents[i] = value => {
                        let option = this.findOption(column, value);
                        let take = {
                            value, option, scope, column, rocTable: this
                        };
                        typeof column.controlEvents[i] === 'function' ? column.controlEvents[i](take) : () => {}
                    }
                };
                return controlEvents;
            }else{
                return controlEvents;
            }
        },
        /**
         * 返回当前选中项
         */
        findOption(column, value){
            let options = this.getOptions(column);
            let valueKey = column.optionControl && column.optionControl.value || column.dict && this.dictControl.value || this.optionControl.value;
            return options.find(item => item[valueKey] === value)
        },
        /**
         * 返回控件选项列表
         */
        getOptions(item){
            return this.dicts[item.dict] || this.$attrs[item.optionsKey] || item.options || [];
        },
        /**
         * 返回选项列表字段值配置
         */
        getOptionsFields(item, opt, field){
            return item.optionControl
                ? opt[item.optionControl[field]]
                : (item.dict ? opt[this.dictControl[field]] : opt[this.optionControl[field]])    
        },
        // 返回控件默认属性
        setControlProperty(item) {
            let {editType, control} = item;
            let _config = deepClone(this.controlProperty[editType]);
            if (control) {
                for (let i in control) {
                    _config[i] = control[i];
                }
            }
            return _config;
        },
        /**
         * 开启监听设置表格高度
         */
        addResizeListener(){
            if(this.autoContainerHeight){
                this.setTableHeight();
                window.addEventListener('resize', this.setTableHeight)
            }
        },
        /**
         * 设置表格高度
         */
        setTableHeight(){
            let tableHeight = this.$el.parentNode.clientHeight;
            // this.subtractHeight && (tableHeight -= this.subtractHeight);
            if(this.subtractHeight){
                tableHeight -= this.subtractHeight
            }
            if(this.pagination){
                let pagination = this.$el.getElementsByClassName('pagination-wrap')[0].getBoundingClientRect();
                tableHeight -= (pagination.height + 1);
            };
            if(this.internalAccessControl.root && this.internalAddButtonControl.location === 'bottom'){
                let height = this.$el.getElementsByClassName('table-new-button-bottom')[0].clientHeight;
                tableHeight -= height;
            }
            this.tableHeight = tableHeight;
            
        }
    },
}
</script>

<style lang="scss" scoped>
@import './style.scss'; 
</style>

<style>
@keyframes flicker {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
</style>