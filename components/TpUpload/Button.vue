<template>
    <div class="tp-upload-button-wrap">
        <el-upload
            ref="upload"
            v-bind="bindValues"
            :file-list="fileList"
            :show-file-list="false"
            @click.native.stop
            :on-exceed="(file,fileList) => {exceedQuantityLimit(file, fileList) }"
            :on-change="(file,fileList) => {handleUploadChange(file, fileList)}"
            :on-remove="(file,fileList) => {handleUploadRemove(file,fileList)}"
            >
            <el-button @click="triggerClick" ref="trigger" slot="trigger" size="mini" type="primary" plain  icon="el-icon-plus" class="trigger-button">点击上传</el-button>
        </el-upload>
        <el-popover
            placement="right"
            width="400"
            trigger="click">
            <TpStupidTable v-bind="tableConfig" :data="fileList">
                <i v-if="!bindValues.limit || (bindValues.limit && bindValues.limit > fileList.length)" @click="callUpload" slot="table-append" class="el-icon-plus tp-append-upload"></i>
            </TpStupidTable>
            <el-badge :value="fileList.length" :hidden="fileList.length === 0" type="primary" slot="reference">
                <el-button @click.native="viewFileList($event)" type="primary"  size="mini" icon="el-icon-folder-opened" class="view-button"></el-button>
            </el-badge>
        </el-popover>
    </div>
</template>

<script>

export default {
    /**
     * author: tan-peng
     * created: 2022-09-17
     */
    name: 'TpUploadButton',
    components: {
        TpStupidTable: () => import('../../index.vue')
    },
    props: {
        /**
         * 文件列表
         */
        fileList: {
            type: Array,
            required: true,
            default(){
                return []
            }
        },
        /**
         * 绑定prop
         */
        control: {
            type: Object,
            default(){
                return {}
            }
        }
    },
    data(){
        return {
            timer: null,
            bindValues: Object.assign(this.control, {
                action: "",
                'auto-upload': false,
                multiple: true,
            }),
            tableConfig: {
                dynamic: true,
                unifiedEdit: true,
                actionButtonType: 'button',
                newActionButton: [
                    {
                        // label: '移除',
                        icon: 'el-icon-close',
                        type: 'text',
                        circle: true,
                        target: 'delete',
                    }
                ],
                column: [
                    { 
                        label: '文件名', 
                        prop: 'name',
                    },
                    { 
                        label: '状态', 
                        prop: 'status',
                        editRender(h, scope){
                            let target = {
                                ready: '待上传',
                                success: '已上传',
                            };
                            return target[scope.row.status] ? target[scope.row.status] : '上传失败'
                        }
                    },
                    { 
                        label: '类型', 
                        prop: 'type',
                        editRender(h, scope){
                            return scope.row.raw?.type ?  (scope.row.raw.type.split('/'))[1] : '--'
                        }
                    },
                    { 
                        label: '大小', 
                        prop: 'size',
                        editRender(h, scope){
                            if(scope.row.size >= 1048576){
                                return scope.row.size / 1048576 + 'm';
                            };
                            return (scope.row.size / 1024).toFixed(2) + 'KB';
                        }
                    },
                ]
            }
        }
    },
    methods: {
        /**
         * 触发上传按钮的点击事件
         * @description: 当达到最大上传数量时阻止打开文件选择的窗口
         */
        triggerClick(event){
            if(this.bindValues.limit && this.bindValues.limit === this.fileList.length){
                this.$message.warning('选择的文件数量已达上限！')
                event.stopPropagation();
            }
        },
        callUpload(){
            this.$refs.trigger.$el.click()
        },
        viewFileList(event){
            if(!this.fileList.length){
                event.stopPropagation();
                this.callUpload()
            }
        },
        /**
         * 选择的文件超出数量限制
         */
        exceedQuantityLimit(){
            this.$message.warning(`选择文件数量超出上限，当前最多还能再选${this.bindValues.limit - this.fileList.length}个！`)
        },
        /**
         * 文件状态改变时
         */
        handleUploadChange(file, fileList){
            console.log("文件状态改变时", file)
            if(file.status === "ready"){
                this.fileList.unshift(file);
                // 上报change事件
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.$emit('change', this.fileList)
                }, 100)
            }
        },
        /**
         * 文件移除时
         */
        handleUploadRemove(file, fileList){
        },
    }
}
</script>

<style scoped>
.tp-upload-button-wrap{
    min-height: 50px;
    display: flex;
    line-height: normal;
    align-items: center;
}
.tp-upload-button-wrap .trigger-button{
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
}
.tp-upload-button-wrap .view-button{
    position: relative;
    padding-left: 10px;
    padding-right: 10px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
}
.tp-upload-button-wrap .view-button::before{
    content: "";
    position: absolute;
    display: block;
    width: 1px;
    top: 5px;
    bottom: 5px;
    left: -2px;
    background: hsla(0,0%,100%,.5);
}
.tp-append-upload{
    box-sizing: border-box;
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background: #F2F6FC; */
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    margin: 4px 0;
}
.tp-append-upload:hover{
    border-color: #409EFF;
}
</style>