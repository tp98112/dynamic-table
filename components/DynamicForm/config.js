export default {
  // 默认控件属性
  defaultControlProperties: {
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
      editable: false,
      clearable: true,
      readonly: false,
      placeholder: "请选择",
    },
    "time-picker": {
      "is-range": true,
      valueFormat: 'HH:ss:mm',
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
      clearable: true,
    },
    't-table': {},
    formList: {}
  }
}