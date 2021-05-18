<template>
  <div>
    <el-upload
      list-type="picture-card"
      :limit="1"
      action="#"
      :file-list="fileList"
      :on-preview="preview"
      :on-remove="handleRemove"
      :on-change="changeFile"
      :before-upload="beforeUpload"
      :http-request="upload"
      :class="{ disabled: fileComputed }"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :visible.sync="showDialog" title="图片预览">
      <img :src="imgUrl" style="width: 100%" alt="" />
    </el-dialog>
    <el-progress
      v-if="showPercent"
      :percentage="percent"
      style="width: 180px"
    ></el-progress>
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5"; //  引入腾讯云 COS 包
// 实例化 COS 对象
const cos = new COS({
  SecretId: "AKIDhR1VifLltkKehTyC9pELCm6AyVlkTu4x", // 身份识别 ID
  SecretKey: "f4B1auxkGXWEfoiLjqiJdgT0HH0TeYBY", // 身份密钥
});
export default {
  data() {
    return {
      fileList: [], // 图片地址设置为数组
      showDialog: false, // 控制显示弹层
      imgUrl: "",
      percent: 0, // 记录当前的百分比
      showPercent: false, // 控制显示
      currentFileUid: null, // 记录当前正在上传的uid
    };
  },
  computed: {
    // 设定一个计算属性 判断是否已经上传完了一张
    fileComputed() {
      return this.fileList.length === 1;
    },
  },
  methods: {
    // 点击预览事件
    preview(file) {
      this.imgUrl = file.url;
      this.showDialog = true;
    },
    // file 要删除的文件
    // fileList 删除过之后的文件
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    changeFile(file, fileList) {
      this.fileList = fileList.map((item) => item);
      // 这里为何 暂时 还不成功呢，因为现在还没有上传，所有第二次进来的数据，一定是个空的
      // 如果上传动作成功了，第一次进入和第二次进入，fileList 的长度应该都是1 应该都有数据
    },
    // beforeUpload 上传文件之前的钩子
    beforeUpload(file) {
      // 首先绑定能够上传的文件类型
      const types = ["image/jpeg", "image/gif", "image/bmp", "image/png"];
      // file 为提交的文件
      if (!types.some((item) => item === file.type)) {
        // 如果不存在
        this.$message.error("上传图片只能是 JPG、GIF、BMP、PNG 格式!");
        // 上传终止
        return false;
      }
      //  检查上传文件的大小
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        // 超过了限制文件的大小
        this.$message.error("上传的文件不得大于5M");
        return false;
      }
      // 已经确定上传的就是当前的这个file
      // 记录 file的id
      this.currentFileUid = file.uid;
      this.showPercent = true;
      return true;
    },
    upload(params) {
      // 自定义上传动作 有个参数 有个file对象，是我们需要上传到腾讯云服务器的内容
      // console.log(params);
      if (params.file) {
        // 执行上传操作
        cos.putObject(
          {
            Bucket: "renzihoutai-1304097566", // 存储桶名称
            Region: "ap-shanghai", // 地域
            Key: params.file.name, // 文件名
            Body: params.file, // 要上传的文件对象
            StorageClass: "STANDARD", // 上传的模式类型 直接默认 标准模式即可
            onProgress: (params) => {
              this.percent = params.percent * 100;
            },
          },
          (err, data) => {
            console.log(err || data);
            if (!err && data.statusCode === 200) {
              // fileList 才能显示到上传组件上 ，讲上传成功地址给fileList
              // 目前虽然是一张图片，但是 fileList 是一个数组
              // 我们需要知道上传成功的 是那一张图片
              this.fileList = this.fileList.map((item) => {
                // 去找谁的uid等于刚刚记录下来的id
                if (item.uid === this.currentFileUid) {
                  // 将成功的地址赋值给原来的url属性
                  return { url: "http://" + data.Location, upload: true };
                  // upload 为true 表示这张图片已经上传完毕 这个属性要为我们后期应用的时候做标记
                  // 保存  => 图片有大有小 => 上传速度有快又慢 =>要根据有没有upload这个标记来决定是否去保存
                }
                return item;
              });
              this.showPercent = false;
              this.percent = 0;
            }
          }
        );
      }
    },
  },
};
</script>

<style>
.disabled .el-upload--picture-card {
  display: none;
}
</style>
