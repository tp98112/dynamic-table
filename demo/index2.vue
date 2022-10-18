<template>
    <div>
        <DynamicTable @row-dblclick="rowDblclick" @cell-dblclick="cellDblclick"  ref="dynamicTable" v-bind="tableConfig"  @change="tableChange">
            <span slot="header-sblx" slot-scope="{scope, $edit}">
                <el-button @click="$edit" size="mini">{{scope.column.$edit ? '保存' : scope.column.label}}</el-button>
            </span>
            
        </DynamicTable>
      <el-button @click="checkTableData">获取表格数据</el-button>
    </div>
</template>

<script>
import DynamicTable from "@/components/DynamicTable";

export default {
    name: "demo",
    components: { DynamicTable},
    data() {
        return {
           tableConfig: {
        dynamic: true,
        // loadData: true,
        actionButtonType: 'link',
        formCols:1, // 一行放置一个
        formDialogWidth: '30%', // 表单弹窗宽度
        newActionButton: [
          {
            target: 'update', // 使用内置的编辑逻辑
            type: 'primary',
            label: '编辑',
          },
          {
            emit: 'view',
            type: 'primary',
            label: '查看碳对象'
          },
          {
            target: 'delete', // 使用内置的删除逻辑
            type: 'danger',
            label: '删除'
          }
        ],
        column: [
          { label: '序号', type: 'index'},
          { 
            label: '组名称', 
            prop: 'name',
            editType: 'input'
          },
          { 
            label: '组编码', 
            prop: 'code',
            editType: 'input'
          },
          { 
            label: '碳对象管理', 
            prop: 'createBy',
            editType: 'link',
            linkText: '查看全部',
            emit: 'carbonObjectMgt',
            columnVisible: false
          },
          { 
            label: '碳对象数量', 
            prop: 'objNum', 
            formVisible: false /**不加入到表单编辑 */
          },
          { 
            label: '创建时间', 
            prop: 'createTime',
            formVisible: false /**不加入到表单编辑 */
          },
          
        ],
        data: [{}],
      },
        };
    },
    created(){
        // this.mergeSameCells();
    },
    mounted(){
       
    },
    methods: {
        mergeSameCells(){
            // 表格数据 this.tableConfig.data
            let flag = this.tableConfig.data[0].sblx;
            let rowspan = 0;
            let startIndex = 0;
            this.tableConfig.data.forEach((item, index) => {
                if(flag === item.sblx){
                    rowspan++;
                }else{
                    this.tableConfig.data[startIndex].rowspan = rowspan;
                    flag = item.sblx;
                    rowspan = 1;
                    startIndex = index;
                }
            })
            console.log(this.tableConfig.data)
        },
        cellDblclick(row, column, cell, event){
            console.log(row, column, cell, event)
        },
        rowDblclick(data){
            console.log(data)
        },
        checkTableData(){
            console.log(this.$refs.dynamicTable.checkTableData() )
           
        },
        tableChange(event) {
            console.log("表格触发事件", event);
            // event.success()
            // event.close();
            // let executeFunc = {
            //   update() {
            //     console.log(event);
            //   },
            // };
            // executeFunc[event.type]();
        },
    },
};
</script>