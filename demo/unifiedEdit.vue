<template>
    <div>
        <DynamicTable ref="dynamicTable" v-bind.sync="tableConfig" :selectOptions="selectOptions" @change="tableChange" @delete="handleDelete"></DynamicTable>
      <el-button @click="test">ceshi</el-button>
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
                border: true,
                // maxHeight: 200,
                dynamic: true, 
                // unifiedEdit: true,
                dblClickToEditCell: true,
                editMode: 'inline',
                rowKey: 'id',
                pagination: true,
                total: 20,
                virtualPage: true,
                reserveSelection: true,
              //  needRefreshEvents: [],
                initFields: {
                    input: '输入框',
                    select: 24,
                },
                accessControl: {
                    update: true,
                    root: true
                    
                },
                column: [
                    {
                        type: 'selection',
                        label: '序号'
                    },
                   
                    
                {
                    label: "输入框",
                    prop: "input",
                    editType: "input",
                    required: true,
                    control: {
                        // type: 'textarea'
                    },
                    // sortable: true,
                    // formVisible({form}){
                    //     return form.select == 1
                    // },
                    // columnVisible: false
                    panel: 1, // 面板
                    //  controlEvents: {
                    //         change(params){
                    //             params.scope.row.select = 2;
                    //         },
                    //     }
                },
                {
                    panel: 1, // 面板
                    label: "下拉框",
                    prop: "select",
                    editType: "select",
                    optionsKey: 'selectOptions',
                    
                },
                {
                    panel: 1, // 面板
                    label: "日期选择器",
                    prop: "address",
                    editType: "date-picker",
                },
                {
                    panel: 2, // 面板
                    label: "开关",
                    prop: "switch",
                    editType: "switch",
                    validator(params){
                    
                       return params.value;
                        
                    },
                    
                    template(scope){
                        return {
                            content: scope.row.switch ? '开启' : '关闭',
                            emit: 'haha'
                        }
                    },
                   
                },
                {
                    panel: 2, // 面板
                    label: "链接",
                    prop: "link",
                    editType: "link",
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
                },
                {
                    panel: 2, // 面板
                    label: '时段',
                    prop: 'time-picker',
                    editType: 'time-picker',
                    width: 200,
                },
                
                ],
                data: [
                    {
                        id: '2121',
                        input: "",
                        select: "1",
                        switch: false,
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
                        switch: false,
                        select: "2",
                        'checkbox-group': [],
                        'time-picker': [new Date(2016, 9, 10, 8, 40), new Date(2016, 9, 10, 9, 40)],
                    },
                ],
            },
        };
    },
    
    mounted(){
        window.this = this;
      let arr = [];
        for(let i = 0; i < 20; i ++ ){
          arr.push({
            id: i + '',
            input: i,
            select: "1",
            'checkbox-group': [],
            'time-picker': '',
            uploadFile: [],
            switch: false,
            uploadImage: [
              {name: '图片', url: 'http://mms2.baidu.com/it/u=4016242268,4022037871&fm=253&app=120&f=JPEG&fmt=auto&q=75?w=501&h=500'}
            ],
          })
        }
       this.tableConfig.data = arr;
    },
    methods: {
        test(){
          let arr = [];
          for(let i = 0; i < 20; i ++ ){
            arr.push({
              id: i + 1,
              input: i + 'haha',
              select: "1",
              'checkbox-group': [],
              'time-picker': '',
              uploadFile: [],
              uploadImage: [
                {name: '图片', url: 'http://mms2.baidu.com/it/u=4016242268,4022037871&fm=253&app=120&f=JPEG&fmt=auto&q=75?w=501&h=500'}
              ],
            })
          }
          this.tableConfig.data = arr;
        },
        tableChange(event) {
            console.log("tableChange", event)
            event.success && event.success()
            // event.close();
            // let executeFunc = {
            //   update() {
            //   },
            // };
            // executeFunc[event.type]();
        },
        handleDelete(event){
             console.log("handleDelete", event)
        }
    },
};
</script>