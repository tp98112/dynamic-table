<template>
    <div style="padding: 10px 20px">
        <!-- <DynamicTable v-bind="test"></DynamicTable> -->
        <DynamicTable ref="dynamicTable" v-bind="tableConfig"  @change="tableChange">
          <!-- <el-button @click="checkTableData" slot="action-header" size="small">批量保存</el-button> -->

            <template v-for="(name, index) of slots" v-slot:[slotName(name)]="scope">
                <el-input-number v-model="scope.row[name]" :key="name" :disabled="scope.row.$saveLoading" size="mini" :min="1" :max="50" ></el-input-number>
                <i v-if="!scope.row.$edit" @click="copy(scope.row[name])" :key="name+index" class="el-icon-document-copy" style="font-size: 14px"></i>
            </template>
          

        </DynamicTable>
    </div>
</template>

<script>
import DynamicTable from "@/components/DynamicTable";

export default {
    name: "demo",
    components: { DynamicTable},
    computed: {
        slotName(){
            return name => {
                return `edit-${name}`
            }
        }
    },
    data() {
        return {
            slots: ['rcz', ],
            tableConfig: {
                dynamic: true, 
                editMode: 'window',
                actionButtonType: 'button',
                actionBarWidth: 140,
                accessControl: {
                    root: true
                },
                newActionButton: [
                    {
                        label: '编辑',
                        target: 'update',
                        type: 'primary',
                        plain: true
                    },
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
                        width: 301,
                        children: [
                            {
                                // fixed: 'left',
                                label: "设备类型",
                                width: 150,
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
                                // fixed: 'left',
                                width: 150,
                                label: "性能指标",
                                prop: 'xnzb',
                                verticalEdit: true,
                                editType: 'input',
                                
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
                               
                               // width: 120,
                                label: "注意上限",
                                prop: 'zysx',
                                headerIcon: 'el-icon-edit',
                                editType: 'input'
                            },
                            {
                               width: 120,
                                label: "注意下限",
                                prop: 'zyxx',
                                editType: 'input'
                            }
                        ]
                    
                    }
                ],
                data: []
            },
        };
    },
    created(){
        this.init()
    },
    methods: {
        init(){
            for(let i=0; i< 10; i++){
                this.tableConfig.data.push({id: 'new'+i,sblx: 1, rcz: 1})
            }
        },
        copy(val){
            this.tableConfig.data.forEach(item => {
                item.rcz = val;
            })
        },
        checkTableData(){
            let data = this.$refs.dynamicTable.checkTableData();
            if(data){
                // 校验获取数据成功
                this.$message.success("校验并获取数据成功, 打开控制台查看打印数据" )
            }
           
        },
        tableChange(event) {
            event.success()
            if(event.type === 'update'){
                // 调用接口更新数据 返回成功后执行 成功回调
                // event.success()
            }
        },
    },
};
</script>