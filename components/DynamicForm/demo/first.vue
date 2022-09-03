<template>
    <div>
        <DynamicForm v-bind="formConfig" :options="options" :cascaderOptions="cascaderOptions" ref="form"></DynamicForm>
        <el-button @click="getFormData">校验并获取表单数据</el-button>
        <el-button @click="resetForm">重置表单</el-button>
    </div>
</template>

<script>
import DynamicForm from '../index.vue';
export default {
    name: 'first',
    components: {DynamicForm},
    data(){
        let id = 0;

        return {
            formConfig: {
                cols: 3,
                formLabelWidth: '110px',
                initFields: {
                  id: '20220711', // 某些不需要编辑但又必须携带的参数也可以在此处简单配置 例如某个id
                  text: '默认值', // 此处的字段值会成为column内对应配置字段的默认值
                  unknown: '未知控件仅显示字段值'
                },
                column: [
                    {
                        label: '文本框',
                        prop: 'text',
                        editType: 'input', // 编辑控件类型
                        control: {
                            // 可绑定所有该控件支持的属性
                            placeholder: '校验汉字'
                        },
                        validator: /^[\u4e00-\u9fa5]{0,}$/, // 正则验证
                        validationTips: '请输入汉字', // 验证失败提示信息
                    },
                    {
                        label: '单选框',
                        prop: 'radio',
                        editType: 'radio',
                        options: [
                            {
                                label: '选项一',
                                value: 1
                            },
                            {
                                label: '选项二',
                                value: 2
                            }
                        ],
                        isRender(){
                            return false;
                        }
                    },
                    {
                        label: '单选框组',
                        prop: 'radioGroup',
                        editType: 'radio-group',
                        options: [
                            {
                                label: '选项一',
                                value: 1
                            },
                            {
                                label: '选项二',
                                value: 2
                            }
                        ]
                    },
                    {
                        label: '多选框',
                        prop: 'checkbox',
                        editType: 'checkbox',
                        checkboxLabel: '多选框'
                    },
                    {
                        label: '多选框组',
                        prop: 'checkboxGroup',
                        editType: 'checkbox-group',
                        options: [
                            {
                                label: '选项一',
                                value: 1
                            },
                            {
                                label: '选项二',
                                value: 2
                            }
                        ]
                    },
                    {
                        label: 'switch',
                        prop: 'switch',
                        editType: 'switch'
                    },
                    {
                        label: '下拉选择器',
                        prop: 'select',
                        editType: 'select',
                        optionsKey: 'options', // 异步数据输入, 指定列表数据来源, 此处名为options的传入prop
                        eventName: 'change', // 绑定的事件类型
                        controlMethod: this.setInputValue, // 写法一: 想要取到当前页面的this, 请将controlMethod指向当前页面的一个method
                        // controlMethod(event){
                        //   /** 写法二
                        //    * event: {params, form, item, that}携带参数
                        //    * @params 控件返回参数
                        //    * @form 当前表单数据
                        //    * @item 当前配置项数据
                        //    * @that 表单组件的this
                        //    * 注: 这里的写法取不到当前页面的this,此函数内this就是当前方法所在的对象
                        //    */
                        //   let {params, form} = event;
                        //   form.text = params // 直接设置表单的字段, 同步更新
                        // },
                        control: {
                            placeholder: '演示事件: 选择时同时设置文本框'
                        }
                    },
                    {
                        label: '日期选择器',
                        prop: 'date-picker',
                        editType: 'date-picker',
                    },
                    {
                        label: '日期范围',
                        prop: 'daterange',
                        editType: 'date-picker', 
                        control: {
                            // 
                            type: 'daterange'
                        }
                    },
                    {
                        label: '计数器',
                        prop: 'inputNumber',
                        editType: 'input-number',
                        control: {
                            min: 0,
                            max: 10
                        },
                    },
                    {
                        label: '级联选择器',
                        prop: 'cascader',
                        editType: 'cascader',
                        optionsKey: 'cascaderOptions',
                        eventName: 'change',
                        controlMethod({params, form}){
                          form.text = params.join('-');
                          console.log(form)
                        },
                        control: {
                            placeholder: '演示事件: 选择后同时设置文本框',
                            props: {
                                // 异步加载方法
                                lazy: true,
                                
                                lazyLoad (node, resolve) {
                                    const { level } = node;
                                    setTimeout(() => {
                                    const nodes = Array.from({ length: level + 1 })
                                        .map(item => ({
                                        value: ++id,
                                        label: `选项${id}`,
                                        leaf: level >= 2
                                        }));
                                    // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                                    resolve(nodes);
                                    }, 500);
                                }
                            }
                        }
                    },
                    {
                        label: '未知控件',
                        prop: 'unknown',
                    },
                    {
                        label: '召唤神兽',
                        prop: 'callGodBeast',
                        editType: 'select',
                        options: [
                            {
                                label: '小白回家吃饭！',
                                value: 'white'
                            },
                            {
                                label: '灰灰回家吃饭',
                                value: 'huihui'
                            },
                            {
                                label: '小白, 灰灰~ 回家吃饭！',
                                value: 'all'
                            },
                        ],
                        control: {
                            placeholder: '小白和灰灰出去玩啦, 点我呼唤它们回家！ ^_^'
                        }
                    },
                    {
                        label: '小白',
                        prop: 'white',
                        editType: 'input',
                        formVisible({form}){
                            return form.callGodBeast === 'white' || form.callGodBeast === 'all';
                        }
                    },
                    {
                        label: '灰灰',
                        prop: 'huihui',
                        editType: 'input',
                        formVisible({form}){
                            return form.callGodBeast === 'huihui' || form.callGodBeast === 'all';
                        }
                    },
                    {
                        label: '独占2列',
                        prop: 'columns2',
                        editType: 'input', // 编辑控件类型
                        cols: 2,
                        control: {
                            type: 'textarea'
                        }
                    },
                    {
                        label: '固定宽度',
                        prop: 'customWidth',
                        editType: 'input',
                        colWidth: '500px',
                        control: {
                            placeholder: '单位自定(px/%/rem...), 如传数字则默认为px'
                        }
                    },
                    {
                      label: '远程搜索',
                      prop: 'remoteSearch',
                      editType: 'autocomplete',
                      control: {
                          // 绑定搜索方法
                          'fetch-suggestions': (queryString, cb) => {
                            let result = queryString ? this.remoteSearchData.filter(item => {
                              return item.dictValue.indexOf(queryString) > -1;
                            }) : this.remoteSearchData
                            cb(result);
                          }
                      }
                    },
                    {
                        editType: 'button-group',
                        options: [
                            {
                                label: '测试',
                                size: 'small',
                                emit: 'test'
                            }
                        ]
                    }
                ]
            },
            options: [{
                value: '选项1',
                label: '黄金糕'
            }, {
                value: '选项2',
                label: '双皮奶'
            }, {
                value: '选项3',
                label: '蚵仔煎'
            }, {
                value: '选项4',
                label: '龙须面'
            }, {
                value: '选项5',
                label: '北京烤鸭'
            }],
           cascaderOptions:[
                {
                    label: '指南',
                    value: 'zhinan',
                    children: [
                        {
                            label: '设计原则',
                            value: 'sjyz'
                        }
                    ]
                },
                {
                    label: '组件',
                    value: 'zujian',
                    children: [
                        {
                            label: 'basic',
                            value: 'basic'
                        }
                    ]
                },
                {
                    label: '资源',
                    value: 'ziiyuan',
                    children: [
                        {
                            label: '文档',
                            value: 'wendang'
                        }
                    ]
                }
           ],
           remoteSearchData: [
            { "dictValue": "三全鲜食（北新泾店）", "address": "长宁区新渔路144号" },
            { "dictValue": "Hot honey 首尔炸鸡（仙霞路）", "address": "上海市长宁区淞虹路661号" },
            { "dictValue": "新旺角茶餐厅", "address": "上海市普陀区真北路988号创邑金沙谷6号楼113" },
            { "dictValue": "泷千家(天山西路店)", "address": "天山西路438号" },
            { "dictValue": "胖仙女纸杯蛋糕（上海凌空店）", "address": "上海市长宁区金钟路968号1幢18号楼一层商铺18-101" },
            { "dictValue": "贡茶", "address": "上海市长宁区金钟路633号" },
            { "dictValue": "豪大大香鸡排超级奶爸", "address": "上海市嘉定区曹安公路曹安路1685号" },
            { "dictValue": "茶芝兰（奶茶，手抓饼）", "address": "上海市普陀区同普路1435号" },
            { "dictValue": "十二泷町", "address": "上海市北翟路1444弄81号B幢-107" },
            { "dictValue": "星移浓缩咖啡", "address": "上海市嘉定区新郁路817号" },
            { "dictValue": "阿姨奶茶/豪大大", "address": "嘉定区曹安路1611号" }]
        }
    },
    created(){
       
    },
    methods: {
        setInputValue({params, form}){
          /* 
           * @example: 这里取到了当前页面的this.options, 筛选出value对应的label并赋值给表单的文本框
          */
          let target = this.options.find(item => {return item.value === params})
          form.text = target.label;
        },
        getFormData(){
           this.$refs.form.validate((valid, form) => {
                console.log(valid, form)
            });
        },
        resetForm(){
          this.$refs.form.resetForm();
        }
    }
}
</script>