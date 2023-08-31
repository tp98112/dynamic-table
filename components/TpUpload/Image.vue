<template>
      <transition-group tag="ul" :class="{'tp-picture-card': true}">
          <li v-for="(file, index) of fileList" @click="setActiveImage(file)" :key="file.uid" class="file-list-wrap-li image-wrap" :tabindex="index">
              <el-image
              style="width: 148px; height: 148px"
              :id="'img_' + file.uid"
              :src="file.url"
              :fit="control.fit ? control.fit : 'fill'"
              :preview-src-list="getPreviewSrcList(fileList)"
              >
              </el-image>
              <div class="list__item-action">
                  <template >
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
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件</div>
      </li>
  </transition-group>
  
</template>

<script>
import {getId} from "../../tools.js";
export default {
    name: 'TpUploadImages',
    props: {
        /**
         * 文件列表
         */
        file: {
            type: [Array, String],
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
        },
        accept: {
            type: String,
            default: "image/png,image/jpeg"
        },
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
        file(){
            this.initFileList()
        },
    },
    data(){
        return {
            fileList: [], // 文件列表
            wrapWidth: 0, // 容器宽度
            imageWidth: 148, // 图片宽度
            imageSpacing: 8, // 图片间距
            activeImage: null, // 活跃图片
            timer: null,
            bindValues: Object.assign({
                action: "",
                'auto-upload': false,
                multiple: true,
                accept: "image/png,image/jpeg"
            },this.control),
        }
    },
    created(){
        this.initFileList()
    },
    mounted(){
        this.wrapWidth = this.$el.parentNode.clientWidth;
    },
    methods: {
        initFileList(){
            if(Array.isArray(this.file)){
                this.fileList = this.file.map(item => {
                    return {
                        uid: getId(true),
                        url: item.url,
                        status: 'success'
                    }
                });
            }else if(typeof this.file === 'string' && this.file){
                this.fileList = [{status: 'success', url: this.file, uid: getId(true)}]
            };
            this.oldLength = this.fileList.length;
        },
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
            if(file.status === "ready"){
                // 检查格式
                if(!file.raw.type || this.bindValues.accept.indexOf(file.raw.type) < 0){
                    this.$message.error('请上传jpeg或png格式的图片！');
                    this.$refs.upload.uploadFiles.splice(this.$refs.upload.uploadFiles.findIndex(item => {item.uid === file.uid}), 1)
                    return;
                };
                if(this.bindValues?.size && file.size / 1024 > this.bindValues.size){
                    // 单位 kb
                    this.$message.error(`上传图片大小不能超过${this.control.size}KB！`);
                    this.$refs.upload.uploadFiles.splice(this.$refs.upload.uploadFiles.findIndex(item => {item.uid === file.uid}), 1)
                    return;
                }
                const isLt2M = file.size / 1024 / 1024 <= 1;
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
            this.$emit('change', this.fileList)
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
// .v-enter,.v-leave-to{
//   opacity: 0;
//   transform: translateX(20px);
// }
// .v-enter-active, .v-leave-active{
//   transition: all .8s ease;
// }

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
  ::v-deep .el-upload--picture-card{
      border: none;
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