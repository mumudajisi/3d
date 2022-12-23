<template>
    <div class="upload-file">
        <el-upload
            ref="upload"
            multiple
            :data="uploadData"
            :action="uploadFileUrl"
            :before-upload="handleBeforeUpload"
            :file-list="fileList"
            :limit="limit"
            :on-error="handleUploadError"
            :on-exceed="handleExceed"
            :on-success="handleUploadSuccess"
            :show-file-list="false"
            :headers="headers"
            class="upload-file-uploader"
        >
            <!-- 上传按钮 -->
            <el-button size="mini" type="primary">选取文件</el-button>
            <!-- 上传提示 -->
            <div v-if="false" slot="tip" class="el-upload__tip">
                请上传
                <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
                <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
                的文件
            </div>
        </el-upload>

        <!-- 文件列表 -->
        <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
            <li v-for="(file, index) in fileList" :key="file.url" class="el-upload-list__item ele-upload-list__item-content">
                <el-link :href="`${file.url}`" :underline="false" target="_blank">
                    <span class="el-icon-document show-overflow-tooltip"> {{ file.name }} </span>
                </el-link>
                <div class="ele-upload-list__item-content-action">
                    <el-link :underline="false" type="danger" @click="handleDelete(index)"><i class="el-icon-delete" /></el-link>
                </div>
            </li>
        </transition-group>
    </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";

export default {
    name: "FileUpload",
    props: {
    // 值
        value: {
            type: [String, Object, Array],
            default: void 0
        },
        // 数量限制
        limit: {
            type: Number,
            default: 5,
        },
        // 大小限制(MB)
        fileSize: {
            type: Number,
            default: 1024,
        },
        // 文件类型, 例如['png', 'jpg', 'jpeg']
        fileType: {
            type: Array,
            default: () => [],
        },
        // 是否显示提示
        isShowTip: {
            type: Boolean,
            default: true
        },
        // 是否校验文件格式
        isVerifyFileType: {
            type: Boolean,
            default: true
        },
        // 文件类型是否必传
        isCheckFileType: {
            type: Boolean,
            default: false
        },
        // 文件上传路径
        dirname: {
            type: String,
            default: () => "/files/resource/1002"
        },
        // 文件名称有的话就替换没有的话就是上传
        fName: {
            type: String,
            default: () => ""
        }
    },
    data() {
        return {
            fileMap: {},
            number: 0,
            uploadList: [],
            baseUrl: process.env.VUE_APP_BASE_API,
            uploadFileUrl: process.env.VUE_APP_BASE_API + "/file/upload", // 文件上传服务器地址
            headers: {
                Authorization: "Bearer " + this.$store.getters["userx/token"],
            },
            uploadData: {
                busiCode: "1002",
                tranCode: "100002",
                roleCode: this.$store.getters["userx/role"].roleKey,
                loginId: this.$store.getters["userx/id"],
                fid: 1,
                dirname: this.dirname,
                filenames: "123.pdf"
            },
            fileList: [],
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
                    let temp = 1;
                    // 首先将值转为数组
                    const list = Array.isArray(val) ? val : this.value.split(",");
                    // 然后将数组转为对象数组
                    this.fileList = list.map(item => {
                        if (typeof item === "string") {
                            item = { name: item, url: item };
                        }
                        item.uid = item.uid || new Date().getTime() + temp++;
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
        // 上传前校检格式和大小
        handleBeforeUpload(file) {
            if (this.isCheckFileType) {
                if (!this.fileType.length || !this.fileType[0]) {
                    this.$modal.msgError("请先选择上传文件类型")
                    return false
                }
            } else {
                if (this.isVerifyFileType) this.fileType = ["zip"]
            }
            // 存取上传文件名
            const uuid = uuidv4()
            this.uploadData.fileSize = (1 * file.size / 1024 / 1024).toFixed(2) + "MB"
            this.uploadData.filenames = this.fName ? this.fName : uuid + "." + file.name.split(".")[1]

            // const fileKey = file.name + file.size + file.lastModified;
            // if (this.fileMap[fileKey]) {
            //     this.uploadData.filenames = this.fileMap[fileKey];
            // } else {
            //     const uuid = uuidv4();
            //     this.uploadData.filenames = this.fName ? this.fName : uuid + "." + file.name.split(".")[1];
            //     this.fileMap[fileKey] = this.uploadData.filenames;
            // }
            // this.uploadData.fileSize = (1 * file.size / 1024 / 1024).toFixed(2) + "MB";

            // 校检文件类型
            if (this.fileType && this.isVerifyFileType) {
                let fileExtension = "";
                if (file.name.lastIndexOf(".") > -1) {
                    fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
                }
                const isTypeOk = this.fileType.some((type) => {
                    if (file.type.indexOf(type) > -1) return true;
                    return !!(fileExtension && fileExtension.indexOf(type) > -1);
                });
                if (!isTypeOk) {
                    this.$modal.msgError(`文件格式不正确, 请上传${this.fileType.join("/")}格式文件!`);
                    return false;
                }
            }
            // 校检文件大小
            if (this.fileSize) {
                const isLt = file.size / 1024 / 1024 < this.fileSize;
                if (!isLt) {
                    this.$modal.msgError(`上传文件大小不能超过 ${this.fileSize} MB!`);
                    return false;
                }
            }
            this.$modal.loading("正在上传文件，请稍候...");
            this.number++;
            return true;
        },
        // 文件个数超出
        handleExceed() {
            this.$modal.msgError(`上传文件数量不能超过 ${this.limit} 个!`);
        },
        // 上传失败
        handleUploadError() {
            this.$modal.msgError("上传文件失败，请重试");
            this.$modal.closeLoading()
        },
        // 上传成功回调
        handleUploadSuccess(res) {
            if (res.respType === 1) {
                this.uploadList.push({
                    fileSize: this.uploadData.fileSize,
                    dirname: this.uploadData.dirname,
                    name: this.uploadData.filenames,
                    url: process.env.VUE_APP_RESOURCE_SERVER + this.uploadData.dirname + "/" + this.uploadData.filenames + "?" + Math.random()
                });
                if (this.uploadList.length === this.number) {
                    this.fileList = this.fileList.concat(this.uploadList);
                    this.uploadList = [];
                    this.number = 0;
                    this.$emit("uploadFiles", this.fileList);
                    this.$modal.closeLoading();
                }
            } else {
                this.$modal.closeLoading();
                this.$modal.msgError(res.respDesc)
                this.fileList = []
            }
        },
        // 删除文件
        handleDelete(index) {
            this.fileList.splice(index, 1);
            this.$emit("uploadFiles", this.fileList);
        },
        // 获取文件名称
        getFileName(name) {
            if (name.lastIndexOf("/") > -1) {
                return name.slice(name.lastIndexOf("/") + 1);
            } else {
                return "";
            }
        },
        // 对象转成指定字符串分隔
        listToString(list, separator) {
            let strs = "";
            separator = separator || ",";
            for (const i in list) {
                strs += list[i].url + separator;
            }
            return strs !== "" ? strs.substr(0, strs.length - 1) : "";
        }
    }
};
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
.show-overflow-tooltip {
    width: 330px;
    overflow:hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
