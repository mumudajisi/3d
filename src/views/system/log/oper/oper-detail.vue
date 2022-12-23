<template>
    <el-dialog v-bind="$attrs" width="700px" title="操作日志详细" custom-class="custom-dialog" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" label-width="100px" size="mini">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="操作模块：">{{ form.tranName }}</el-form-item>
                    <el-form-item label="登录信息：">{{ form.loginId }} / {{ form.clientIp }} / {{ form.ipAddr }}</el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="请求地址：">{{ form.tranPath }}</el-form-item>
                    <el-form-item label="请求方式：">{{ form.reqMode }}</el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="请求参数：">{{ form.reqParam }}</el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="返回参数：">
                        <div class="text-over">{{ form.rspParam }}</div>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="操作状态：">
                        <div v-if="form.status === 0">失败</div>
                        <div v-else-if="form.status === 1">成功</div>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="操作时间：">{{ form.createTime }}</el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="异常信息：">{{ form.respDesc }}</el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="cancel">关 闭</el-button>
        </div>
    </el-dialog>
</template>

<script>
export default {
    name: "OperDetail",
    props: {
        row: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            form: {
                tranName: "",
                loginId: "",
                clientIp: "",
                ipAddr: "",
                tranPath: "",
                reqMode: "",
                reqParam: "",
                rspParam: "",
                status: 1,
                createTime: "",
                respDesc: "",
            },
        };
    },
    methods: {
        open() {
            this.form = Object.assign(this.form, this.row);
        },
        cancel() {
            this.$emit("update:visible", false);
        },
    },
};
</script>

<style lang="scss" scoped>
.text-over {
    max-height: 300px;
    overflow-y: auto;
}
</style>
<style lang="scss">
.custom-dialog {
    .el-dialog__header,
    .el-dialog__footer {
        background-color: rgb(237, 241, 242);
    }
}
</style>
