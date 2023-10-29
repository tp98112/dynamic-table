export default {
    data(){
        return {
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
                'time-picker': this.getPickerInitTime(),
                unknown: '' // 未知的
            }), // 受支持的预设控件
            controlProperty: Object.freeze({
                select: {
                    size: "mini",
                    filterable: true,
                    placeholder: "请选择",
                    
                },
                input: {
                    type: "input",
                    size: "mini",
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
                    format: "yyyy-MM-dd",
                    "value-format": "yyyy-MM-dd",
                    size: "mini",
                    editable: false,
                    clearable: false,
                    readonly: false,
                    placeholder: "请选择",
                },
                'time-picker': {
                    size: 'mini',
                    'is-range': true,
                    'range-separator': '至',
                    'start-placeholder': '开始时间',
                    'end-placeholder': "结束时间",
                    placeholder:"选择时间范围"
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
                'input-number': {
                    size: "mini",
                }, // 计数器
                'checkbox-group': {}, // 多选框组
                'upload-button': {
                    action: "",
                    'auto-upload': false,
                    multiple: true,
                    'show-file-list': false, // 不展示上传列表
                }
            })
            
        } 
    },
    methods: {
        /**
         * 设置时间选择器初始值
         */
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
    }
}