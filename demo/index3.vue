<template>
    <div>
        <DynamicTable ref="dynamicTable" v-bind="tableConfig"  :selectOptions="selectOptions" @change="tableChange">
        <!-- <el-button slot="new-button" size="small" slot-scope="{event, scope}" @click="event">{{scope.row.input}}</el-button> -->
        <!-- <template v-slot:new-button="{event}">
            <el-button @click="event"></el-button>
        </template> -->
       <!-- <div slot="form-input" slot-scope="{form}">{{form.input}}</div> -->
       
        </DynamicTable>
      <el-button @click="checkTableData">获取表格数据</el-button>
    </div>
</template>

<script>
import DynamicTable from "@/components/DynamicTable";
import {dateFormat} from "../tools.js";
export default {
    name: "demo",
    components: { DynamicTable},
    data() {
        return {
            formColumn: [
                {
                    panel: 1, // 面板
                    label: "下拉框",
                    prop: "select",
                    align: "center",
                    editType: "select",
                    optionsKey: 'selectOptions',
                    
                },
            ],
            selectOptions: [
                        {
                            label: "选项一",
                            value: 1,
                        },
                        {
                            label: "选项二",
                            value: 2,
                        },
                    ],
            tableConfig: {
                height: 500,
                // maxHeight: 200,
                dynamic: true, 
                // unifiedEdit: false,
                editMode: 'window',
                rowKey: 'id',
                pagination: true,
                total: 100002,
                virtualPage: true,
                needRefreshEvents: [],
                initFields: {
                    input: '输入框',
                    select: 24,
                   
                },
                accessControl: {
                    update: true,

                    
                },
                // formDialogButton: [
                //     {
                //         icon: 'el-icon-check',
                //         label: '确 定1',
                //         type: 'primary',
                //         emit: '$save'
                //     },
                //     {
                //         icon: 'el-icon-check',
                //         label: 'hahah',
                //         type: 'primary',
                //         emit: '$save2'
                //     },
                // ],
                // newActionButton: [
                //     {
                //         label: '面板一',
                //         target: 'update',
                //         panel: 1,
                //     },
                //     {
                //         label: '面板二',
                //         target: 'update',
                //         panel: 2,
                //     },
                //     {
                //         label: '测试',
                //         emit: 'haha'
                //     }
                // ],
                column: [
                    {
                        type: 'index',
                        label: '序号'
                    },
                   
                    
                {
                    label: "输入框",
                    prop: "input",
                    align: "center",
                    editType: "input",
                    required: true,
                    // sortable: true,
                    // formVisible({form}){
                    //     return form.select == 1
                    // },
                    // columnVisible: false
                    panel: 1, // 面板
                    eventName: 'blur',
                    // controlMethod(params){
                    // },
                     controlEvents: {
                            change(params){
                              console.log(params)
                            },
                        }
                },
                {
                    panel: 1, // 面板
                    label: "下拉框",
                    prop: "select",
                    align: "center",
                    editType: "select",
                    optionsKey: 'selectOptions',
                    
                },
                {
                    panel: 1, // 面板
                    label: "日期选择器",
                    prop: "address",
                    align: 'center',
                    editType: "date-picker",
                },
                {
                    panel: 2, // 面板
                    label: "开关",
                    prop: "switch",
                    align: 'center',
                    editType: "switch",
                    template(scope){
                        return scope.row.switch ? '开启' : '关闭'
                    },
                   
                },
                {
                    panel: 2, // 面板
                    label: "链接",
                    prop: "link",
                    align: 'center',
                    editType: "link",
                    emit: 'link'
                },
                {
                    panel: 2, // 面板
                    label: '多选框组',
                    prop: 'checkbox-group',
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
                    ],
                    align: 'center'
                },
                {
                    panel: 2, // 面板
                    label: '时段',
                    prop: 'time-picker',
                    editType: 'time-picker',
                    width: 200,
                },
                {
                    panel: 2, // 面板
                    label: '下拉树',
                    prop: 'select-tree',
                    editType: 'select-tree',
                    options: [
                        {
                            label: '乌鲁木齐市',
                            value: '2',
                            children: [
                            { label: '达坂城区', value: '7' },
                            { label: '头屯河区', value: '8' },
                            { label: '乌鲁木齐县', value: '9' }
                            ]
                        }
                    ]
                },
                {
                    label: '选择文件2',
                    prop: 'uploadImage',
                    cols:2,
                    editType: 'upload-image',
                    control: {
                        // limit: 5,
                        'show-file-list': true
                    },
                    // columnVisible: false,
                    
                },
                {
                    label: '选择文件1',
                    prop: 'uploadFile',
                    cols: 2,
                    minWidth: 200,
                    editType: 'upload-button',
                    // formVisible: false,
                }
                ],
                data: [
                    {
                        id: '2121',
                        input: "12",
                        select: "1",
                        'checkbox-group': [],
                        'time-picker': '',
                        uploadFile: [],
                       uploadImage: [
                        {name: '图片', url: 'http://mms2.baidu.com/it/u=4016242268,4022037871&fm=253&app=120&f=JPEG&fmt=auto&q=75?w=501&h=500'}
                       ],
                    },
                    {
                        id: '12',
                        input: "1",
                        select: "2",
                        'checkbox-group': [],
                        'time-picker': [new Date(2016, 9, 10, 8, 40), new Date(2016, 9, 10, 9, 40)],
                    },
                ],
            },
        };
    },
    
    mounted(){
        let num = 30;
        let arr = [];
       while(num){
        arr.push({
            input: num,
            switch: 1
        })
        num--
       }
       this.$refs.dynamicTable.checkExpectFieldsType(arr)
    //    this.tableConfig.data = arr;
       
    },
    methods: {
        checkTableData(){
           
        },
        tableChange(event) {
            event.success()
            // event.close();
            // let executeFunc = {
            //   update() {
            //   },
            // };
            // executeFunc[event.type]();
        },
    },
};
</script>