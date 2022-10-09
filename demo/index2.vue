<template>
    <div>
        <DynamicTable ref="dynamicTable" v-bind="tableConfig"  @change="tableChange">
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
                needRefreshEvents: [],
                newActionButton: [
                    {
                        label: '编辑',
                        type:'primary',
                        plain: true,
                        target: 'update',
                    }
                ],
                align: 'center',
                column: [
                    {
                        type: 'index',
                        label: '序号'
                    },
                    {
                        label: "基本信息",
                        children: [
                            {
                                label: "设备类型",
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
                                label: "日测值",
                                prop: 'rcz',
                                verticalEdit: true,
                                editType: 'input'
                            },
                            {
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
                                label: "注意上限",
                                prop: 'zysx',
                                headerIcon: 'el-icon-edit',
                                editType: 'input'
                            },
                            {
                                label: "注意下限",
                                prop: 'zyxx',
                                editType: 'input'
                            }
                        ]
                    
                    }
                ],
                data: [
                    {id: 1,sblx: '设备类型', xnzb: '', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 2,sblx: '设备类型', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'},
                    {id: 3,sblx: '设备类型', xnzb: '性能指标', rcz: '10', zcz: '20', zysx: '注意上限', zyxx: '注意下限'}
                ]
            },
        };
    },
    mounted(){
       
    },
    methods: {
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