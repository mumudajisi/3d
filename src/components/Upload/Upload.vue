<template>
    <el-upload
        ref="upload"
        class="avatar-uploader"
        :accept="accept"
        :action="defaultAction"
        :data="defaultData"
        :headers="baseHeaders"
        :show-file-list="false"
        :on-success="onSuccess"
        :on-error="onError"
    >
        <img v-if="value" :src="value" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon" />
    </el-upload>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "Upload",
    props: {
        action: {
            type: String,
            default: void 0,
        },
        value: {
            type: String,
            default: void 0,
        },
        headers: {
            type: Object,
            default: () => ({}),
        },
        accept: {
            type: String,
            default: ".jpeg,.png,.jpg,.bmp,.gif,.webp",
        },
        data: {
            type: Object,
            default: () => ({}),
        }
    },
    data() {
        return {};
    },
    computed: {
        ...mapGetters(["userInfo", "defaultRole", "token"]),
        baseHeaders() {
            return {
                Authorization: "Bearer " + this.token,
                ...this.headers,
            };
        },
        defaultAction() {
            return process.env.VUE_APP_BASE_API + "/file/upload"
        },
        defaultData() {
            const dirname = "/train3d" + this.data.dirname
            return {
                fid: 1,
                busiCode: "1002",
                tranCode: "100001",
                loginId: this.userInfo?.username,
                roleCode: this.userInfo?.username === "admin" ? "plat" : this.defaultRole?.roleKey,
                ...this.data,
                dirname
            }
        }
    },
    methods: {
        createApi(api, ip) {
            return process.env.NODE_ENV === "development" ? api : ip;
        },
        onSuccess(response, file, fileList) {
            if (response.respType === 1) {
                const imgUrl = process.env.VUE_APP_IMG_API + this.data.dirname + "/" + file.name;
                this.$emit("success", imgUrl)
            } else {
                this.$message({
                    type: "error",
                    message: response.respDesc,
                    duration: 2000,
                });
            }
        },
        onError(err, file, fileList) {
            console.log(err, file, fileList);
        },
    },
};
</script>

<style lang="scss" scoped>
.avatar-uploader::v-deep .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}
.avatar {
    width: 100px;
    height: 100px;
    display: block;
}
</style>
