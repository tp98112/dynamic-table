<template>
  <el-upload 
    v-bind="bindValues"
    ref="upload"
    :show-file-list="true"
    :file-list="fileList"
    list-type="picture-card"
    :on-exceed="(file, fileList) => { exceedQuantityLimit(file, fileList) }"
    :on-change="(file, fileList) => { handleUploadChange(file, fileList) }"
  >
    <i slot="default" class="el-icon-plus"></i>
    <div slot="file" slot-scope="{ file }">
      <el-image
        style="width: 148px; height: 148px"
        :id="'img_' + file.uid"
        :src="file.url"
        :fit="control.fit ? control.fit : 'fill'"
        :preview-src-list="getPreviewSrcList(fileList)"
      >
      </el-image>
      <span class="el-upload-list__item-actions">
        <span
          class="el-upload-list__item-preview"
          @click="handlePictureCardPreview(file)"
        >
          <i class="el-icon-zoom-in"></i>
        </span>
        <span
          class="el-upload-list__item-delete"
          @click="handleDownload(file)"
        >
          <i class="el-icon-download"></i>
        </span>
        <span
          class="el-upload-list__item-delete"
          @click="removeUploadImg(file)"
        >
          <i class="el-icon-delete"></i>
        </span>
      </span>
    </div>
  </el-upload>
</template>

<script>
import {getId} from "../../tools.js";
export default {
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
        default: "image/png,image/jpeg,image/gif"
    },
  },
  data() {
    return {
      fileList: [], // 文件列表
      activeImage: null, // 活跃图片
      timer: null,
      bindValues: Object.assign({
          action: "",
          'auto-upload': false,
          multiple: true,
          accept: "image/png,image/jpeg,image/gif"
      },this.control),
    };
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
  created(){
    this.initFileList()
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
    },
    /**
     * 文件状态改变时
     */
    handleUploadChange(file, fileList){
      console.log('文件状态改变时', file)
      if(file.status === "ready"){
        // 检查格式
        if(!file.raw.type || this.bindValues.accept.indexOf(file.raw.type) < 0){
          this.$message.error(`请上传 ${this.getAcceptFileType()} 格式的图片！`);
          this.$refs.upload.uploadFiles.splice(this.$refs.upload.uploadFiles.findIndex(item => {item.uid === file.uid}), 1)
          return;
        };
        if(this.bindValues?.size && file.size / 1024 > this.bindValues.size){
          // 单位 kb
          this.$message.error(`上传图片大小不能超过${this.control.size}KB！`);
          this.$refs.upload.uploadFiles.splice(this.$refs.upload.uploadFiles.findIndex(item => {item.uid === file.uid}), 1)
          return;
        }
        this.fileList.push(file);
        // 上报change事件
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.$emit('change', this.fileList)
        }, 100)
      }
    },
    getAcceptFileType(){
      const regex = /image\/(\w+)/g;  // 匹配 image/ 后面的字符串
      let matches = [];
      let match;
      while ((match = regex.exec(this.bindValues.accept)) !== null) {
        matches.push(match[1]);  // 提取捕获组中的内容
      }
      const formats = matches.join(", ");
      return formats;
    },
    /**
     * 大图预览
    */
    handlePictureCardPreview(file) {
      document.getElementById("img_" + file.uid).click();
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
  },
};
</script>
