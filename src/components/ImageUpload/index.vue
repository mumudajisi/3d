<template>
    <div class="component-upload-image">
        <el-upload
            multiple
            :data="uploadData"
            :action="uploadImgUrl"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :before-upload="handleBeforeUpload"
            :limit="limit"
            :on-error="handleUploadError"
            :on-exceed="handleExceed"
            name="file"
            :on-remove="handleRemove"
            :show-file-list="true"
            :headers="headers"
            :file-list="fileList"
            :on-preview="handlePictureCardPreview"
            :class="{hide: fileList.length >= limit}"
        >
            <i class="el-icon-plus" />
        </el-upload>

        <!-- 上传提示 -->
        <!-- <div v-if="showTip" slot="tip" class="el-upload__tip">
            请上传
            <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
            <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
            的文件
        </div> -->

        <el-dialog
            :visible.sync="dialogVisible"
            title="预览模型"
            custom-class="menu-dialog-height"
            width="800"
            append-to-body
        >
            <img
                :src="dialogImageUrl"
                style="display: block; max-width: 100%; margin: 0 auto"
            >
        </el-dialog>
    </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
export default {
    props: {
        value: {
            type: [String, Object, Array],
            default: void 0
        },
        // 图片数量限制
        limit: {
            type: Number,
            default: 5,
        },
        // 大小限制(MB)
        fileSize: {
            type: Number,
            default: 20,
        },
        // 图片类型, 例如['png', 'jpg', 'jpeg']
        fileType: {
            type: Array,
            default: () => ["png", "jpg", "jpeg"],
        },
        // 是否显示提示
        isShowTip: {
            type: Boolean,
            default: true
        },
        // 文件上传路径
        dirname: {
            type: String,
            default: () => "/files/resource"
        },
        // 文件名称有的话就替换没有的话就是上传
        fName: {
            type: String,
            default: () => ""
        }
    },
    data() {
        return {
            number: 0,
            isfullscreen: true, // 是否全屏
            uploadList: [],
            dialogImageUrl: "",
            dialogVisible: false,
            hideUpload: false,
            baseUrl: process.env.VUE_APP_BASE_API,
            uploadImgUrl: process.env.VUE_APP_BASE_API + "/file/upload", // 上传的图片服务器地址
            headers: {
                ContentType: "multipart/form-data",
                Authorization: "Bearer " + this.$store.getters["userx/token"],
            },
            fileList: [],
            uploadData: {
                busiCode: "1002",
                tranCode: "100001",
                roleCode: this.$store.getters["userx/role"].roleKey,
                loginId: this.$store.getters["userx/id"],
                fid: 1,
                dirname: this.dirname,
                filenames: "123.png"
            }
        };
    },
    computed: {
    // 是否显示提示
        showTip() {
            return this.isShowTip && (this.fileType || this.fileSize);
        },
    },
    watch: {
        value: {
            handler(val) {
                if (val) {
                    // 首先将值转为数组
                    const list = Array.isArray(val) ? val : this.value.split(",");
                    // 然后将数组转为对象数组
                    this.fileList = list.map(item => {
                        if (typeof item === "string") {
                            if (item.indexOf(this.baseUrl) === -1 && item.indexOf("http") === -1) {
                                item = { name: this.baseUrl + item, url: this.baseUrl + item };
                                // console.log(this.baseUrl, item);
                            } else {
                                item = { name: item, url: item };
                            }
                        }
                        return item;
                    });
                } else {
                    this.fileList = [];
                    return [];
                }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        // 删除图片
        handleRemove(file, fileList) {
            const findex = this.fileList.map(f => f.name).indexOf(file.name);
            if (findex > -1) {
                this.fileList.splice(findex, 1);
                this.$emit("uploadImage", this.fileList);
            }
        },
        // 上传成功回调
        handleUploadSuccess(res) {
            if (res.respType === 1) {
                this.uploadList.push({
                    dirname: this.uploadData.dirname,
                    name: this.uploadData.filenames,
                    url: process.env.VUE_APP_RESOURCE_SERVER + this.uploadData.dirname + "/" + this.uploadData.filenames + "?" + Math.random()
                });
                if (this.uploadList.length === this.number) {
                    this.fileList = this.fileList.concat(this.uploadList);
                    this.uploadList = [];
                    this.number = 0;
                    this.$emit("uploadImage", this.fileList);
                    this.$modal.closeLoading();
                }
            } else {
                this.$modal.closeLoading();
                this.$modal.msgError(res.respDesc)
                this.dialogImageUrl = ""
                this.fileList = []
            }
        },
        // 上传前loading加载
        handleBeforeUpload(file) {
            const uuid = uuidv4()
            this.uploadData.filenames = this.fName ? this.fName : uuid + "." + file.name.split(".")[1]
            let isImg = false;
            if (this.fileType.length) {
                let fileExtension = "";
                if (file.name.lastIndexOf(".") > -1) {
                    fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
                }
                isImg = this.fileType.some(type => {
                    if (file.type.indexOf(type) > -1) return true;
                    return !!(fileExtension && fileExtension.indexOf(type) > -1);
                });
            } else {
                isImg = file.type.indexOf("image") > -1;
            }

            if (!isImg) {
                this.$modal.msgError(`文件格式不正确, 请上传${this.fileType.join("/")}图片格式文件!`);
                return false;
            }
            if (this.fileSize) {
                const isLt = file.size / 1024 / 1024 < this.fileSize;
                if (!isLt) {
                    this.$modal.msgError(`上传头像图片大小不能超过 ${this.fileSize} MB!`);
                    return false;
                }
            }
            this.$modal.loading("正在上传图片，请稍候...");
            this.number++;
        },
        // 文件个数超出
        handleExceed() {
            this.$modal.msgError(`上传文件数量不能超过 ${this.limit} 个!`);
        },
        // 上传失败
        handleUploadError() {
            this.$modal.msgError("上传图片失败，请重试");
            this.$modal.closeLoading();
        },
        // 预览
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        },
        // 对象转成指定字符串分隔
        listToString(list, separator) {
            let strs = "";
            separator = separator || ",";
            for (const i in list) {
                strs += list[i].url.replace(this.baseUrl, "") + separator;
            }
            return strs !== "" ? strs.substr(0, strs.length - 1) : "";
        }
    }
};
</script>
<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
::v-deep.hide .el-upload--picture-card {
    display: none;
}
// 去掉动画效果
::v-deep .el-list-enter-active,
::v-deep .el-list-leave-active {
    transition: all 0s;
}
::v-deep .el-list-enter, .el-list-leave-active {
    opacity: 0;
    transform: translateY(0);
}
::v-deep .el-upload--picture-card {
    line-height: 106px;
    width: 100px !important;
    height: 100px !important;
}
::v-deep .el-upload-list--picture-card .el-upload-list__item {
    width: 100px;
    height: 100px;
}
</style>
