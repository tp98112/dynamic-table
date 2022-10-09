export default {
    data(){
        return {
            actionButtonFontSize:{
                button: 12,
                link: 14
            }, // 操作栏按钮文字大小
            defaultAccessControl: {
                // 操作栏按钮访问控制
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
                ...this.accessControl
            },
            privateFields: ['$edit', '$index', '$rootIndex', '$saveLoading', '$deleteLoading', '$new', '$rowKey'], // 组件私有属性
            supportedComponents: Object.freeze({
                'date-picker': '', // 时间选择器
                input: '', // 文本输入框
                switch: false, // 开关
                select: '', // 下拉选择器
                link: '', // 文字链接
                'fixed-time-select': '', // 固定时段选择器 24小时
                'upload-img': '', // 图片上传
                radio: '', // 单选框
                'radio-group': '', // 单选框组
                checkbox: '', // 多选框
                'checkbox-group': [], // 多选框组
                'input-number': 0, // 计数器
                cascader: [], // 级联选择器
                autocomplete: '', // 远程搜索
                'time-picker': [],
                unknown: '' // 未知的
            }), // 受支持的预设控件
            presetControlsEvents: Object.freeze({
                input: ['blur', 'click', 'focus', 'change', 'input', 'clear'],
                'input-number': ['change', 'blur', 'focus'],
                select: ['change', 'visible-change', 'remove-tag', 'clear', 'blur', 'focus'],
                'date-picker': ['change', 'blur', 'focus'],
                switch: ['change'],
                radio: ['change'],
                'radio-group': ['change'],
                checkbox: ['change'],
                'checkbox-group': ['change'], // 多选框组
                cascader: ['change', 'expand-change', 'blur', 'focus', 'visible-change', 'remove-tag'],
                link: ['click'],
                autocomplete: ['select', 'change']
            }),
            builtInButton: Object.freeze([
                {
                    icon: 'el-icon-check',
                    title: '保存',
                    target: 'save'
                },
                {
                    icon: 'el-icon-refresh-right',
                    title: '取消',
                    target: 'cancel'
                },
                {
                    icon: 'el-icon-delete-solid',
                    title: '移除',
                    target: 'remove'
                }
            ]),
            
        } 
    }
}