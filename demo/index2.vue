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
                height: 500,
                // maxHeight: 200,
                dynamic: true, 
                accessControl: {
                    cancel: false
                },
                actionButtonType: 'link',
                needRefreshEvents: [],
                newActionButton: [
                    {
                        label: '测试',
                        type:'primary',
                        plain: true,
                        emit: '测试',
                    },
                    {
                        label: '编辑',
                        type:'primary',
                        plain: true,
                        emit: 'update2',
                    }
                ],
                align: 'center',
                // spanMethod({ row, column, rowIndex, columnIndex }){
                //     if (columnIndex === 1) {
                //         if (row.rowspan) {
                            
                //             return {
                //                 rowspan: row.rowspan,
                //                 colspan: 1
                //             };
                //         } else {
                //             return {
                //                 rowspan: 0,
                //                 colspan: 0
                //             };
                //         }
                //     }
                // },
                column: [
                    {
                        fixed: 'left',
                        type: 'index',
                        label: '序号',
                        
                    },
                    {
                        fixed: 'left',
                        label: "基本信息",
                       width: 300,
                        children: [
                            {
                                fixed: 'left',
                                label: "设备类型",
                                width: 150,
                                verticalEdit: true, // 纵向编辑 开启后点击表头编辑当前列
                                prop: 'sblx',
                                editType: 'input',
                                required: true,
                                validateTips: '设备类型只能为1',
                                validator({value}){
                                    return value == 1
                                }
                            },
                            {
                                fixed: 'left',
                                width: 150,
                                label: "性能指标",
                                prop: 'xnzb',
                                verticalEdit: true,
                                editType: 'select',
                                required: true
                            }
                        ]
                    
                    },
                    {
                        label: "系统遥测智",
                        children: [
                            {
                                // width: 150,
                                label: "日测值",
                                prop: 'rcz',
                                verticalEdit: true,
                                editType: 'input'
                            },
                            {
                                // width: 150,
                                label: "周测值",
                                prop: 'zcz',
                                verticalEdit: true,
                                editType: 'input'
                            }
                        ]
                    
                    },
                    {
                        label: "阈值告警",
                        children: [
                            {
                                // width: 150,
                                label: "注意上限",
                                prop: 'zysx',
                                headerIcon: 'el-icon-edit',
                                editType: 'input'
                            },
                            {
                                // width: 150,
                                label: "注意下限",
                                prop: 'zyxx',
                                editType: 'input'
                            }
                        ]
                    
                    }
                ],
                data: [
                    {id: 1,sblx: '1', xnzb: '', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 2,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 3,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 4,sblx: '2', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 5,sblx: '2', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 6,sblx: '3', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 7,sblx: '3', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'}
                ]
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