<template>
  <el-upload 
    v-if="Array.isArray(fileList)"
    ref="upload"
    :show-file-list="true"
    :fileList="fileList"
    listType="picture-card"
    :action="action"
    :multiple="multiple"
    :autoUpload="autoUpload"
    :accept="accept"
    :limit="limit"
    v-bind="control"
    :on-exceed="exceedQuantityLimit"
    :on-change="handleUploadChange"
    :on-success="handleOnSuccess"
    :on-error="handleOnError"
    :before-upload="handleBeforeUpload"
    :on-progress="handleOnProgress"
    :class="{'el-upload-list--picture-wrap': true, 'disabled-animation': disabledAnimation || !fileList.length}"
  >
    <i slot="default" class="el-icon-plus"></i>
    <div slot="file" slot-scope="{ file }" 
    v-loading="file.$loading"
    element-loading-spinner="el-icon-loading"
    element-loading-text="上传中...">
      <span v-if="file.status === 'success'" class="success-mark"><i class="el-icon-check"></i></span>
      <el-image
        style="width: 148px; height: 148px;"
        :src="file.url"
        :fit="fit"
        :preview-src-list="getPreviewSrcList(fileList)"
      >
      </el-image>
      <span class="el-upload-list__item-actions">
        <span
          class="el-upload-list__item-preview"
          @click="handlePictureCardPreview"
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
          v-if="mode !== 'view'"
          class="el-upload-list__item-delete"
          @click="handleRemoveUploadImg(file)"
        >
          <i class="el-icon-delete"></i>
        </span>
      </span>
    </div>

    <!-- 上传提示 -->
    <div class="el-upload__tip" slot="tip" v-if="showTip" style="margin-top: 0px">
      请上传
      <template v-if="size"> 大小不超过 <b style="color: #f56c6c">{{ getFileSize }}</b>， </template>
      <template v-if="accept"> 格式为 <b style="color: #f56c6c">{{ getAcceptFileType() }}</b> </template>
      的图片
    </div>
  </el-upload>
</template>

<script>
export default {
  name: "TuploadImages",
  props: {
    /**
     * 绑定prop
     */
    control: {
        type: Object,
        default(){
            return {}
        }
    },
    /**
     * 文件列表
     */
    fileList: {
        type: [Array, String],
        required: true,
        default(){
            return []
        }
    },
    action: {
      // 上传地址
      type: String
    },
    multiple: {
      // 多选
      type: Boolean,
      default: true
    },
    autoUpload: {
      // 是否自动上传
      type: Boolean,
      default: false
    },
    accept: {
      // 文件类型限制
      type: String,
      default: '"image/png,image/jpeg,image/gif"'
    },
    limit: {
      // 文件数量限制
      type: Number
    },
    size: {
      // 文件大小限制
      type: Number
    },
    fit: {
      // 确定图片如何适应到容器框
      // fill / contain / cover / none / scale-down
      type: String,
      default: 'fill'
    },
    showTip:  {
      // 是否显示上传提示
      type: Boolean,
      default: true
    },
    decimalPlace: {
      // 限制文件大小, 保留小数位数
      type: Number,
      default: 2
    },
    mode: {
      type: String,
      default: 'new'
    },
    onSuccess: {
      type: Function
    },
    onError: {
      type: Function
    },
    showSuccessMark: {
      // 显示上传成功状态的标识
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      timer: null,
      disabledAnimation: false,
      tasks: 0, // 任务数量
      successTasks:0, // 成功的任务
      errorTasks:0, // 失败的任务
      completedTask: 0, // 已结束的任务
    };
  },
  computed: {
    getFileSize(){
      let {size, decimalPlace} = this;
      let index = 0;
      if(size){
        const units = ['KB', 'MB'];
        while (size >= 1024 && index < units.length - 1) {
          size /= 1024; // 当大小超过 1MB 时，转换为 MB 和 KB 的形式
          index++;
        }
        let pow = Math.pow(10, decimalPlace);
        size = parseInt(size * pow) / pow;
        return `${ size } ${units[index]}`; // 返回转换后的文件大小字符串，保留两位小数
      }
      return ""
    }
  },
  watch: {
    mode(){
      this.setUploadElementDisplay();
    },
    fileList(value){
      if(Array.isArray(value)){
        this.$nextTick(() => {
          this.setUploadElementDisplay(value.length && true || false);
        })
      }else{
        // 重置文件列表
        this.setUrlToFileList();
      }
    },
    tasks(val){
      if(!val){
        this.showUploadResultMessage();
      }
    },
  },
  created(){
    if(Array.isArray(this.fileList)){
        this.$nextTick(() => {
          this.setUploadElementDisplay();
        })
      }else{
        // 重置文件列表
        this.setUrlToFileList();
      }
  },
  methods: {
    showUploadResultMessage(){
      if(!this.errorTasks){
        this.$message.success(`上传${this.tasks > 1 && '全部图片' || '图片'}成功！`);
        this.$emit("success", {success: this.successTasks, error: this.errorTasks})
      }else if(!this.successTasks){
        this.$message.error("上传图片失败！")
      }else{
        this.$message.warning(`${this.successTasks}张图片上传成功，${this.errorTasks}张图片上传失败！`)
      }
      this.$emit("uploadTaskEnd", {success: this.successTasks, error: this.errorTasks})
      this.successTasks = 0;
      this.errorTasks = 0;
      this.disabledAnimation = false;
    },
    handleHttpRequest(event){
      console.log("event", event)
    },
    /**
     * 文件状态改变时
     */
    handleUploadChange(file, fileList){
      // console.log(file, file.status)
      if(file.status === "ready"){
        // 检查格式
        if(!this.handleCheckFormat(file)){
          return;
        }
        this.fileList.push(file);
        this.setUploadElementDisplay()
        // 上报change事件
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.$emit('change', this.fileList)
        }, 100)
      }
    },
    handleOnProgress(event, file, fileList){
      // console.log("文件上传时的钩子", file, file.status)
      file.$loading = true;
    },
    /**
     * 上传成功的回调
     */
    handleOnSuccess(response, file, fileList){
      // console.log("上传成功的回调", response, fileList)
      let done = () => {
        this.tasks--;
        this.successTasks++;
        file.$loading = false;
      };
      if(typeof this.onSuccess === 'function'){
        this.onSuccess({response, file, fileList, done } )
      }else{
        done();
      }
    },
    /**
     * 上传失败的回调
     */
    handleOnError(err, file, fileList){
      file.$loading = false;
      this.tasks--;
      this.errorTasks++;
      this.setUploadElementDisplay();
      this.$emit('change', fileList);
      if(typeof this.onSuccess === 'function'){
        this.onError(response, file, fileList)
      }
    },
    handleBeforeRemove(file, fileList){
      console.log("handleBeforeRemove", file)
    },
    handleBeforeUpload(file){
      console.log(file);
      this.disabledAnimation = true;
      this.tasks++; // 标记上传任务
      this.$set(file, '$loading', true)
    },
    /**
     * 检查文件格式
     */
    handleCheckFormat(file){
      if(!file.raw.type || this.accept.indexOf(file.raw.type) < 0){
        this.$message.error(`请上传 ${this.getAcceptFileType()} 格式的图片！`);
        this.$refs.upload.uploadFiles.splice(this.$refs.upload.uploadFiles.findIndex(item => {item.uid === file.uid}), 1)
        return false;
      };
      if(this.size && file.size / 1024 > this.size){
        // 单位 kb
        this.$message.error(`上传图片大小不能超过${this.size}KB！`);
        this.$refs.upload.uploadFiles.splice(this.$refs.upload.uploadFiles.findIndex(item => {item.uid === file.uid}), 1)
        return false;
      }
      return true;
    },
    /**
     * 转文件列表
     */
    setUrlToFileList(){
      if(this.fileList && typeof this.fileList === 'string'){
        this.$emit('change', [{url: this.fileList, status: 'success'}])
      }else{
        this.$emit('change', [])
      }
    },
    setUploadElementDisplay(hasDelay){
      let element = this.$el.getElementsByClassName('el-upload--picture-card');
      if(this.mode === 'view' || this.fileList.length === this.limit){
        element && element[0] && (element[0].style.display = 'none');
        element && element[0] && (element[0].style.visibility = 'hidden');
      }else{
        if(element && element[0]){
          if(hasDelay){
            setTimeout(() => {
              element[0].style.removeProperty('display');
              setTimeout(() => {
                element[0].style.removeProperty('visibility');
              }, 50)
            }, 1200)
          }else{
            element[0].style.removeProperty('display');
            setTimeout(() => {
                element[0].style.removeProperty('visibility');
              }, 50)
          }
        }
      }
    },
    /**
     * 获取预览列表
     */
    getPreviewSrcList() {
      return Array.isArray(this.fileList) && this.fileList.map((item) => item.url) || [];
    },
    getAcceptFileType(){
      const regex = /image\/(\w+)/g;  // 匹配 image/ 后面的字符串
      let matches = [];
      let match;
      while ((match = regex.exec(this.accept)) !== null) {
        matches.push(match[1]);  // 提取捕获组中的内容
      }
      const formats = matches.join(", ");
      return formats;
    },
    /**
     * 大图预览
    */
    handlePictureCardPreview(e) {
      let target = e.target?.parentElement?.parentElement?.previousSibling?.children[0];
      target && target.click();
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
    handleRemoveUploadImg(file){
      this.fileList.some((item,index) => {
        if(item.uid === file.uid){
            this.fileList.splice(index, 1)
            return true;
        }
      })
      if(!this.fileList.length){
        this.setUploadElementDisplay()
      }
      this.$emit('change', this.fileList)
    },
    /**
     * 选择的文件超出数量限制
     */
    exceedQuantityLimit(){
      if(!this.fileList.length){
        this.$message.warning(`最多选择${this.limit}张图片！`)
      }else{
        this.$message.warning(`选择图片数量超出上限，当前最多还能再选${this.limit - this.fileList.length}张！`)
      }
      
    },
    /**
     * 手动上传
     */
    submitUpload() {
      this.$refs.upload.submit();
    },
  },
};
</script>

<style lang="scss" scoped>
.el-upload-list--picture-wrap{
  min-height: 200px;
  ::v-deep.el-upload--picture-card{
    margin-bottom: 14.4px;
  }
  ::v-deep.el-upload-list__item{
    margin: 0 8px 0px 0;
  }

  .success-mark{
    position: absolute;
    z-index: 1;
    right: -17px;
    top: -7px;
    width: 46px;
    height: 26px;
    background: #13ce66;
    text-align: center;
    transform: rotate(45deg);
    box-shadow: 0 1px 1px #ccc;
    i{
      font-size: 12px;
      margin-top: 12px;
      transform: rotate(-45deg);
    }
  }
}

.disabled-animation{
  ::v-deep.el-upload-list__item{
    transition: none !important;
  }
}
</style>
