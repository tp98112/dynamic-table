<template>
    <div>
        <dynamic-form ref="form" style="width: 50%" v-bind="config"></dynamic-form>
        <el-button @click="getForm" type="primary">获取数据</el-button>
    </div>
</template>

<script>
import DynamicForm from "@/components/DynamicTable/components/DynamicForm";
export default {
    components: {DynamicForm},
    data(){
        return {
            config: {
                column: [
                    {label: '设计单位', prop: 'sjdw', editType: 'input', module: 'kyxx', required: true},
                    {label: '完成时间', prop: 'wcsj', editType: 'input', module: 'kyxx'},
                    {label: '文本附件', prop: 'wbfj', editType: 'input', module: 'kyxx'},

                     {label: '设计单位2', prop: 'sjdw',editType: 'input', module: 'csxx', required: true},
                    {label: '完成时间2', prop: 'wcsj',editType: 'input', module: 'csxx'},
                    {label: '文本附件2', prop: 'wbfj',editType: 'input', module: 'csxx'},
                ]
            }
        }
    },
    methods: {
        getForm(){
            this.$refs.form.validate(({valid, form, module}) => {
            })
        }
    }
}
</script>