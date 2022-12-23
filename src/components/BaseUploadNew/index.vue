<template>
    <div>
        <!--:on-progress="onProgress" 上传时的钩子函数-->
        <!--:on-change="onChange" 状态改变的钩子函数-->
        <!--:on-error="onError" 文件上传失败的钩子函数-->
        <el-upload
            ref="upload"
            :action="item.actionUrl || actionUrl"
            :headers="item.headers || headers"
            :data="item.data || {}"
            :name="item.uploadName || 'file'"
            :accept="item.accept"
            :list-type="item.listType"
            :auto-upload="item.autoUpload"
            :file-list="fileList"
            :disabled="item.disabled"
            :limit="item.limit"
            :on-preview="onPreview"
            :on-remove="onRemove"
            :on-success="onSuccess"
            :before-upload="(file) => beforeUpload(item, file)"
            :before-remove="beforeRemove"
            :http-request="
                item.httpRequest && ((file) => item.httpRequest(item, file, onSuccess))
            "
            :on-exceed="onExceed"
            :class="{
                hide: newForm.length >= item.limit || fileList.length >= item.limit,
            }"
        >
            <i v-if="item.listType === 'picture-card'" class="el-icon-plus" />
            <el-button
                v-else
                slot="trigger"
                type="primary"
                icon="el-icon-folder-opened"
            >
                选择文件
            </el-button>
            <el-button
                v-if="item.autoUpload === false && item.listType !== 'picture-card'"
                type="primary"
                style="margin-left: 10px"
                icon="el-icon-upload"
                @click="submitUpload"
            >
                上传到服务器
            </el-button>
            <div
                v-if="item.tips"
                slot="tip"
                class="el-upload__tip"
                v-html="item.tips"
            />
        </el-upload>
        <el-button
            v-if="item.autoUpload === false && item.listType === 'picture-card'"
            type="primary"
            style="margin-top: 10px"
            icon="el-icon-upload"
            @click="submitUpload"
        >
            上传到服务器
        </el-button>
        <el-dialog :visible.sync="dialogVisible" append-to-body>
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
    </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid"

export default {
    name: "BaseUpload",
    model: {
        prop: "form",
        event: "newForm"
    },
    props: {
        item: {
            type: Object,
            default() {
                return {}
            }
        },
        form: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            newForm: this.form,
            fileList: [],
            actionUrl: process.env.VUE_APP_BASE_API + "/file/upload", // 上传的图片服务器地址
            headers: {
                ContentType: "multipart/form-data",
                Authorization: "Bearer " + this.$store.getters["userx/token"]
            },
            dialogImageUrl: "",
            dialogVisible: false
        }
    },
    watch: {
        newForm() {
            this.$emit("newForm", this.newForm)
        }
    },
    methods: {
        // 点击之后上传到服务器
        submitUpload() {
            this.$refs.upload.submit()
        },

        // 点击文件列表中已上传的文件时的钩子
        onPreview(file) {
            this.dialogImageUrl = file.url
            this.dialogVisible = true
        },

        // 上传文件之前的钩子, 校验文件格式和文件大小
        beforeUpload(item, file) {
            const testMsg = file.name.substring(file.name.lastIndexOf(".") + 1)
            if (item.filenames) {
                item.data[item.filenames] =
                    item.randomName === false ? file.name : uuidv4() + "." + testMsg
            } else {
                item.data.filenames =
                    item.randomName === false ? file.name : uuidv4() + "." + testMsg
            }
            item.fileType =
                item.fileType ||
                "doc,docx,xls,xlsx,pdf,ppt,pptx,txt,jpg,jpeg,jpe,png,gif,rar,zip"
            item.fileSize = item.fileSize || 50
            const type = item.fileType.split(",")
            const index = type.indexOf(testMsg)
            this.$loading({
                lock: true,
                text: "上传中请稍候...",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)"
            })
            if (type.indexOf(testMsg) !== -1 || item.fileType === "*") {
                const extension = testMsg === type[index]
                const isLt = file.size / 1024 / 1024 < item.fileSize
                if (!extension && item.fileType !== "*") {
                    this.$message.warning(`上传文件只能是${item.fileType}格式!`)
                    return false
                }
                if (!isLt) {
                    this.$message.warning(`上传文件大小不能超过 ${item.fileSize}MB!`)
                    return false
                }
                return (extension || item.fileType === "*") && isLt
            } else {
                this.$message.warning(`上传文件只能是${item.fileType}格式!`)
                return false
            }
        },

        // 文件上传成功时的钩子
        onSuccess(response, file, fileList) {
            if (["PLATB402", "PLATB014", "PLATB400"].includes(response?.respCode)) {
                this.$message.error(response.respDesc)
                this.$store.dispatch("user/logout").then(() => {
                    location.href = "/"
                })
            }
            const arrList = []
            fileList.map((val) => {
                if (val?.response?.respType === 1) {
                    const url = val.response.respData[val.name]
                    val.fileSize = val.size
                    val.dirname = url.substring(0, url.lastIndexOf("/"))
                    val.fileName = url.substring(url.lastIndexOf("/") + 1)
                    val.url = process.env.VUE_APP_RESOURCE_SERVER + "/" + url
                    arrList.push(val)
                }
            })
            this.$loading({}).close()
            this.$set(this, "newForm", arrList)
        },

        // 文件超出个数限制时的钩子
        onExceed() {
            this.$message.warning(`上传文件数量不能超过 ${this.item.limit} 个!`)
        },

        // 删除文件之前的钩子，参数为上传的文件和文件列表，若返回 false 或者返回 Promise 且被 reject，则停止删除。
        beforeRemove(file, fileList) {
            // TODO 这里还得删除呢, 没有接口先别急, 首先判断是否上传成功,上传成功了才调删除接口,判断删除是否成功,没成功的话 return false
            console.log(file, fileList, "删除之前")
        },

        // 文件列表移除文件时的钩子
        onRemove(file, fileList) {
            this.$set(this, "newForm", fileList)
            console.log(file, fileList, "移除文件")
        }

        // 文件上传失败时的钩子
        // onError(err, file, fileList) {
        //   console.log(err, file, fileList, "上传失败");
        // },

        // 文件上传时的钩子
        // onProgress(event, file, fileList) {
        //   console.log(event, file, fileList, "上传时");
        // },

        // 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
        // onChange(file, fileList) {
        //   console.log(file, fileList, "状态改变");
        // },
    }
}
</script>

<style lang="scss" scoped>
::v-deep .hide .el-upload--picture-card {
    display: none;
}

::v-deep .el-upload-list--picture-card .el-upload-list__item {
    border: none;
}
</style>
