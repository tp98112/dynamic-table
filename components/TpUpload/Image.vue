<template>
    <transition-group tag="ul" :class="{'tp-picture-card': true, 'tp-stacked-picture-card': stacked}">
        <li v-for="(file, index) of fileList" @click="setActiveImage(file)" :key="index" class="file-list-wrap-li image-wrap" :tabindex="index">
            <el-image
            class="el-upload-list__item-thumbnail"
            :id="'img_' + file.uid"
            :src="file.url"
            :preview-src-list="getPreviewSrcList(fileList)"
            >
            </el-image>
            <div class="list__item-action">
                <template v-if="activeImage === file.uid || !stacked">
                    <span @click="handlePictureCardPreview(file)"><i class="el-icon-zoom-in"></i></span>
                    <span @click="handleDownload(file)"><i class="el-icon-download"></i></span>
                    <span><i @click="removeUploadImg(file)" class="el-icon-delete"></i></span>
                </template>
            </div>
        </li>
        <li v-show="bindValues.limit && bindValues.limit > fileList.length || !bindValues.limit" class="file-list-wrap-li upload-wrap" key="trigger" >
            <el-upload
                v-bind="bindValues"
                ref="upload"
                :show-file-list="false"
                :file-list="fileList"
                list-type="picture-card"
                :on-exceed="(file, fileList) => { exceedQuantityLimit(file, fileList) }"
                :on-change="(file, fileList) => { handleUploadChange(file, fileList) }">
                <i class="el-icon-plus trigger" slot="trigger"></i>
            </el-upload>
        </li>
    </transition-group>
    
</template>

<script>

export default {
    name: 'TpUploadImages',
    props: {
        /**
         * 图片是否堆叠
         */
        stack: {
            type: Boolean,
            default: false
        },
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
    computed: {
        /**
         * 获取预览列表
         */
        getPreviewSrcList() {
            return (arr) => {
                return arr.map((item) => item.url);
            };
        },
    },
    watch: {
        fileList(val){
            if(this.stack){
                this.setStackPicture(val.length > this.oldLength ? 'add' : 'remove')
                this.activeImage = this.fileList[0]?.uid;
                this.oldLength = val.length;
            };
            
        }
    },
    data(){
        return {
            wrapWidth: 0, // 容器宽度
            stacked: false, // 标记是否堆叠
            oldLength: this.fileList.length,
            imageWidth: 148, // 图片宽度
            imageSpacing: 8, // 图片间距
            activeImage: null, // 活跃图片
            timer: null,
            bindValues: Object.assign(this.control, {
                action: "",
                // limit: 3,
                'auto-upload': false,
                multiple: true,
            }),
        }
    },
    mounted(){
        this.wrapWidth = this.$el.parentNode.clientWidth;
    },
    methods: {
        /**
         * 设置激活图片
         */
        setActiveImage(file){
            if(this.stacked){
                // event.target.parentNode.parentNode.classList.add('active')
                this.activeImage = file.uid;
            }
        },
        /**
         * 更新堆叠位置
         */
        updateStackedPosition(callback){
            let elements = this.$el.getElementsByClassName('file-list-wrap-li');
            if(elements.length === this.fileList.length + 1){
                elements = Array.from(elements);
                callback(elements);
                return;
            }else{
                setTimeout(() => {
                    this.updateStackedPosition(callback)
                }, 20);
            };
        },
        /**
         * 设置图片堆叠
         */
        setStackPicture(type){
            let desiredWidth = this.fileList.length * (this.imageWidth + this.imageSpacing) + this.imageWidth;
            console.log('需要宽度', desiredWidth, '容器宽度', this.wrapWidth)
            if(desiredWidth > this.wrapWidth){
                this.stacked = true; // 标记已进入堆叠状态
                this.$nextTick(() => {
                    let differ = desiredWidth - this.wrapWidth; // 差的宽度
                    this.updateStackedPosition(elements => {
                        elements.forEach((element, index) => {
                            element.style.zIndex = elements.length - index;
                            if(index){
                                if(index === elements.length -1){
                                    // 上传区域定位
                                    element.style.left = `${156*index-((differ / (this.fileList.length-1))*(index -1))}px`;
                                    return;
                                };
                                // 图片定位
                                element.style.left = `${156*index-((differ / (this.fileList.length-1))*index)}px`;
                            }else{
                                element.style.left = '0px';
                            }
                        });
                    })
                    
                })
            }else if(this.stacked && desiredWidth < this.wrapWidth){
                // 未达到堆叠宽度
                this.updateStackedPosition(elements => {
                    elements.forEach((element, index) => {
                        element.style.left = '0px';
                    });
                    this.stacked = false;
                })
            }
            
        },
        /**
         * 下载图片
         */
        handleDownload(file) {
            if(file.url){
                const alink = document.createElement('a');
                fetch(file.url).then(res => res.blob()).then(blob => { // 将链接地址字符内容转变成blob地址
                    alink.href = URL.createObjectURL(blob);
                    alink.download = file.name || '图片_' + file.uid; // 下载文件的名字
                    document.body.appendChild(alink);
                    alink.click();
                    //在资源下载完成后 清除 占用的缓存资源
                    URL.revokeObjectURL(alink.href);
                    document.body.removeChild(alink);
                })
            }else{
                this.$message.error('图片异常，暂不能提供下载！')
            }
        },
        /**
         * 大图预览
        */
        handlePictureCardPreview(file) {
            document.getElementById("img_" + file.uid).click();
        },
        /**
         * 文件状态改变时
         */
        handleUploadChange(file, fileList){
            console.log(file)
            if(file.status === "ready"){
                this.fileList.push(file);
                // 上报change事件
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.$emit('change', this.fileList)
                }, 100)
                
            }
        },
        /**
         * 移除图片
         */
        removeUploadImg(file){
            this.fileList.some((item,index) => {
                if(item.uid === file.uid){
                    this.fileList.splice(index, 1)
                    return true;
                }
            })

        },
        /**
         * 选择的文件超出数量限制
         */
        exceedQuantityLimit(){
            this.$message.error(`选择图片数量超出上限，当前最多还能再选${this.bindValues.limit - this.fileList.length}张！`)
        },
    }
}
</script>

<style lang="scss" scoped>
.v-enter,.v-leave-to{
    opacity: 0;
    transform: translateX(20px);
}
.v-enter-active, .v-leave-active{
    transition: all .8s ease;
}

.tp-picture-card{
    display: flex;
    flex-wrap: wrap;
    margin:0px;
    margin-left: -8px;
    padding: 0px;
    list-style: none;
    .image-wrap{
        width: 148px;
        height: 148px;
        position: relative;
        border: 1px solid #c0ccda;
        border-radius: 6px;
        box-sizing: border-box;
        margin: 0px 0px 8px 8px;
        overflow: hidden;
        background: #c0ccda;
        i{
            font-size: 18px;
            color: #fff;
        }
    }
    .trigger{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 148px;
        height: 148px;
        box-sizing: border-box;
        background-color: #fbfdff;
        border: 1px dashed #EBEEF5;
        border-radius: 6px;
    }
    .upload-wrap{
        margin-left: 8px;
    }
}
// 堆叠
.tp-stacked-picture-card{
    position: relative;
    height: 148px;
    li{
        transition: .4s;
        position: absolute !important;
    }
    .image-wrap:not(:first-child){
        transform: rotate3d(0, 1, -0.1, -24deg)
    } 
    .image-wrap{
        box-shadow: 6px 5px 8px #ccc;
        &:hover{
            box-shadow: 6px 5px 8px #fff;
            transform: scale(1.04) translate(2%) rotateY(0deg) ;
        };
        &:focus{
            z-index: 999 !important;
            transform: scale(1.1) translate(20%) !important;
        }
        
    }
    
}
// 操作栏
.list__item-action{
    position: absolute;
    top:0px;
    left: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    transition: .4s;
    &:hover{
        background: rgba(0,0,0, .2);
        span{
            display: inline-block;
        }
    }
    span{
        display: none;
        color: #fff !important;
        font-size: 20px;
        cursor: pointer;
    }
}



</style>
