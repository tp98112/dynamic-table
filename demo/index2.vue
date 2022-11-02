<template>
    <div>
        <DynamicTable @selection-change="selectionChange" @row-dblclick="rowDblclick" @cell-dblclick="cellDblclick"  ref="dynamicTable" v-bind="tableConfig"  @change="tableChange">
          
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
                editMode: 'inline',
                actionButtonType: 'button',
                newActionButton: [
                    {
                        label: '编辑',
                        target: 'update',
                        type: 'primary',
                        plain: true
                    },
                    {
                        label: '删除',
                        target: 'delete',
                        type: 'danger',
                        plain: true
                    }
                ],
                needRefreshEvents: [],
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
                                width: 149.5,
                                verticalEdit: true, // 纵向编辑 开启后点击表头编辑当前列
                                prop: 'sblx',
                                editType: 'input',
                                required: true,
                                // validateTips: '设备类型只能为1',
                                // validator({value}){
                                //     return value == 1
                                // }
                            },
                            {
                                fixed: 'left',
                                width: 149.5,
                                label: "性能指标",
                                prop: 'xnzb',
                                verticalEdit: true,
                                editType: 'select',
                                required: true,
                                options: [
                                    {
                                        label: '选项一',
                                        value: 1
                                    }
                                ]
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
                    {id: 1,sblx: '1', xnzb: '', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限',
                   },
                    {id: 2,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 3,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 4,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 5,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 6,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 7,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 8,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 9,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 10,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 11,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 12,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 13,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 14,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 15,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 16,sblx: '1', xnzb: '性能指标', rcz: '10', zcz:  '3', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 17,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 18,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 19,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 20,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 21,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 22,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 23,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 24,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 25,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 26,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 27,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 28,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 29,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 30,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 32,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 33,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 34,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 35,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 36,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 37,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 38,sblx: '1', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'}
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
        selectionChange(list){
            console.log(list)
        },
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
            event.success()
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