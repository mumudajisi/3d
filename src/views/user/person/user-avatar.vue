<template>
    <div>
        <div class="user-info-head" @click="editCropper()">
            <img :src="options.img" title="点击上传头像" class="img-circle img-lg" alt="点击上传头像">
        </div>
        <el-dialog :title="title" :visible.sync="open" append-to-body @opened="modalOpened" @close="closeDialog">
            <el-row>
                <el-col :xs="24" :md="12" :style="{height: '350px'}">
                    <vue-cropper
                        v-if="visible"
                        ref="cropper"
                        :img="options.img"
                        :info="true"
                        :auto-crop="options.autoCrop"
                        :auto-crop-width="options.autoCropWidth"
                        :auto-crop-height="options.autoCropHeight"
                        :fixed-box="options.fixedBox"
                        @realTime="realTime"
                    />
                </el-col>
                <el-col :xs="24" :md="12" :style="{height: '350px'}">
                    <div class="avatar-upload-preview">
                        <img :src="previews.url" :style="previews.img" alt="头像">
                    </div>
                </el-col>
            </el-row>
            <br>
            <el-row>
                <el-col :lg="3" :md="2">
                    <el-upload :action="action" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
                        <el-button size="small">
                            选择
                            <i class="el-icon-upload el-icon--right" />
                        </el-button>
                    </el-upload>
                </el-col>
                <el-col :lg="{span: 1, offset: 2}" :md="2">
                    <el-button v-if="selected" icon="el-icon-plus" size="small" @click="changeScale(1)" />
                    <el-button v-else disabled icon="el-icon-plus" size="small" />
                </el-col>
                <el-col :lg="{span: 1, offset: 1}" :md="2">
                    <el-button v-if="selected" icon="el-icon-minus" size="small" @click="changeScale(-1)" />
                    <el-button v-else disabled icon="el-icon-minus" size="small" />
                </el-col>
                <el-col :lg="{span: 1, offset: 1}" :md="2">
                    <el-button v-if="selected" icon="el-icon-refresh-left" size="small" @click="rotateLeft()" />
                    <el-button v-else disabled icon="el-icon-refresh-left" size="small" />
                </el-col>
                <el-col :lg="{span: 1, offset: 1}" :md="2">
                    <el-button v-if="selected" icon="el-icon-refresh-right" size="small" @click="rotateRight()" />
                    <el-button v-else disabled icon="el-icon-refresh-right" size="small" />
                </el-col>
                <el-col :lg="{span: 2, offset: 6}" :md="2">
                    <el-button v-if="selected" type="primary" size="small" @click="uploadImg()">提 交</el-button>
                    <el-button v-else disabled type="primary" size="small">提 交</el-button>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
import { VueCropper } from "vue-cropper";
import { uploadAvatar } from "@/api/file";

export default {
    name: "UserAvatar",
    components: { VueCropper },
    props: {
        user: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            action: "/file/upload",
            selected: false,
            // 是否显示弹出层
            open: false,
            // 是否显示cropper
            visible: false,
            // 弹出层标题
            title: "修改头像",
            options: {
                // 裁剪图片的地址
                img: this.$store.getters["userx/avatar"],
                autoCrop: true, // 是否默认生成截图框
                autoCropWidth: 200, // 默认生成截图框宽度
                autoCropHeight: 200, // 默认生成截图框高度
                fixedBox: true // 固定截图框大小 不允许改变
            },
            previews: {},
        };
    },
    mounted() {
        this.$bus.$on("updateAvatar", () => {
            this.options.img = this.$store.getters["userx/avatar"]
        })
    },
    beforeDestroy() {
        this.$bus.$off("updateAvatar")
    },
    methods: {
        // 编辑头像
        editCropper() {
            this.open = true
        },
        // 打开弹出层结束时的回调
        modalOpened() {
            this.visible = true
        },
        // 关闭窗口
        closeDialog() {
            this.visible = false
        },
        // 覆盖默认的上传行为
        requestUpload() {
        },
        // 向左旋转
        rotateLeft() {
            this.$refs.cropper.rotateLeft();
        },
        // 向右旋转
        rotateRight() {
            this.$refs.cropper.rotateRight();
        },
        // 图片缩放
        changeScale(num) {
            num = num || 1;
            this.$refs.cropper.changeScale(num);
        },
        // 上传预处理
        beforeUpload(file) {
            if (file.type.indexOf("image/") === -1) {
                this.$modal.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
            } else {
                const isRightSize = (file.size || 0) / 1024 / 1024 < 2
                if (!isRightSize) {
                    this.$message.error("文件大小超过 2MB")
                    return false
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.options.img = reader.result;
                };
                this.selected = true
            }
        },
        // 上传图片
        uploadImg() {
            this.$refs.cropper.getCropBlob(data => {
                const userImg = this.user.userId + "-avatar.png";
                const formData = new FormData();
                formData.set("busiCode", "1001")
                formData.set("tranCode", "100001")
                formData.set("roleCode", "plat")
                formData.set("loginId", this.user.userId)
                formData.set("fid", 1)
                formData.set("dirname", process.env.VUE_APP_IMG_DIR)
                formData.set("filenames", userImg)
                formData.append("file", data);
                uploadAvatar(formData).then(response => {
                    this.open = false;
                    this.visible = false;
                    if (response.respType === 1) {
                        this.$store.commit("userx/SET_AVATAR", process.env.VUE_APP_AVATAR_PATH + userImg + "?v=" + Math.random());
                        this.$store.commit("userx/SET_CUSTOM", true);
                        this.$modal.msgSuccess("修改成功");
                        this.$bus.$emit("updateAvatar")
                    } else {
                        this.$modal.msgSuccess("修改失败");
                    }
                }).catch(err => {
                    this.$modal.msgSuccess("修改失败");
                    console.log(err.message)
                });
            });
        },
        // 实时预览
        realTime(data) {
            this.previews = data;
        },
    }
}
</script>
<style scoped lang="scss">
::v-deep {
    .el-dialog {
        width: 800px;
        height: 800px;
        background: #EDFDFC;
    }

    .el-dialog__body {
        max-height: 120vh;
    }

    .user-info-head {
        position: relative;
        display: inline-block;
        width: 120px;
        height: 120px;
    }

    .user-info-head:hover:after {
        content: '+';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        color: #eee;
        background: rgba(0, 0, 0, 0.5);
        font-size: 24px;
        font-style: normal;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        cursor: pointer;
        line-height: 110px;
        border-radius: 50%;
    }
}
</style>
