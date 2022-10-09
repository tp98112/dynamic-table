import { Button } from "element-ui"

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
        loadData: {
            // 为true时将触发一次分页事件
            type: Boolean,
            default: false
        },
        emitDataType: {
            /**
             * 组件emit事件传递的数据类型  引用/非引用
             * reference: 引用 父组件拿到的参数发生更改将同步影响表格
             * non-reference: 非引用 表格传递的参数经过了深拷贝 父组件对数据进行更改不会影响表格
             * */ 
            type: String,
            default: 'non-reference' // 非引用 组件传递的参数经过深拷贝 
        },
        unifiedEdit:{
            /** 为true时统一编辑和保存 为false时为单行独立增删改 */ 
            type: Boolean,
            default: false
        },
        deleteReport:{
            /** 统一编辑模式下 删除事件是否上报 */ 
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
            default: true
        },
        tableSize: {
            // 表格尺寸 medium / small / mini
            type: String,
            default: 'mini'
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
        boxSelectStyle: {
            // 校验失败的标记样式 在el-table__cell上
            type: Object,
            default(){
                return {background: '#EBEEF5'}
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
            default: 'inline'
        },
        needRefreshEvents: {
            // 当设置内的事件被触发时, 将触发一次刷新当前页的事件
            type: Array,
            default(){
                // ['new', 'delete', 'update']
                // 更新默认不请求翻页
                return ['new', 'delete', 'update']
            }
        },
        insertDataMethod: {
            // 插入数据的方法 push或unshift
            type: [String],
            default: 'unshift',
            validator(val){
                return val === 'unshift' || val === 'push'
            }
        },
        defaultPrompt: {
            // 是否显示内置提示
            type: Boolean,
            default: true
        },
        showAction: {
            /** 操作栏显隐状态 */ 
            type: Boolean,
            default: true
        },
        actionAlign: {
            // 操作栏按钮对齐方式 left/center/right
            type: String,
            default: 'center'
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
            default: 'button'
        },
        // 操作栏按钮大小
        actionButtonSize: {
            type: String,
            default: 'mini'
        },
        pagination: {
            // 是否展示分页
            type: Boolean,
            default: false
        },
        falsePaging: {
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
        total: {
            // 分页总数
            type: Number,
            default: 0
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
        defaultSort: {
            // 默认排序方式
            type: Object,
        },
        newActionButton: {
            // 按钮集合
            type: Array,
            default() {
                return [
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
                ]
            }
        },
        cellDblclick: {
            // 单元格双击事件
            type: Function,
        },
        formColumn: {
            // 编辑表单数据项配置 该值不传时取column
            type: Array,
        },
        formCols: {
            // 表单一行放置控件数量
            type: [Number, String],
            default: 2
        },
        formDialogButtonSize: {
            type: String,
            default: 'small'
        },
        formDialogWidth: {
            // 表单弹窗宽度
            type: [Number, String],
            default: '50%'
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
                        icon: 'el-icon-check',
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
}