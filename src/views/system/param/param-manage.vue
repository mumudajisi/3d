<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}参数`" width="500px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="参数名称" prop="paramName">
                <el-input v-model="form.paramName" placeholder="请输入参数名称" />
            </el-form-item>
            <el-form-item label="参数键名" prop="paramKey">
                <el-input v-model="form.paramKey" placeholder="请输入参数键名" />
            </el-form-item>
            <el-form-item label="参数键值" prop="paramValue">
                <el-input v-model="form.paramValue" placeholder="请输入参数键值" />
            </el-form-item>
            <el-form-item label="系统内置" prop="paramType">
                <el-radio-group v-model="form.paramType">
                    <el-radio :label="1">内置</el-radio>
                    <el-radio :label="2">外部</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="描述" prop="remark">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { param } from "@/api";

export default {
    name: "ParamManage",
    props: {
        type: {
            type: String,
            default: "add",
        },
        row: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            loading: false,
            form: {
                id: "",
                paramName: "",
                paramKey: "",
                paramValue: "",
                paramType: 1,
                remark: "",
            },
            roleList: [],
            postList: [],
            rules: {
                paramName: [{ required: true, message: "参数名称不能为空", trigger: "blur" }],
                paramKey: [{ required: true, message: "参数键名不能为空", trigger: "blur" }],
                paramValue: [{ required: true, message: "参数键值不能为空", trigger: "blur" }],
            },
        };
    },
    computed: {
        titleText() {
            return {
                add: "添加",
                edit: "修改",
            }[this.type];
        },
    },
    methods: {
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, ...otherForm } = this.form;
                        if (this.type === "add") {
                            await param.addParam(otherForm);
                        } else {
                            await param.updateParam({ id, ...otherForm });
                        }
                        this.$modal.msgSuccess(`${this.titleText}成功`);
                        this.cancel();
                        this.$emit("success");
                    } catch (error) {
                        console.log(error);
                    } finally {
                        this.loading = false;
                    }
                }
            });
        },
        cancel() {
            this.$emit("update:visible", false);
            this.reset();
        },
        // 表单重置
        reset() {
            this.form = {
                id: "",
                paramName: "",
                paramKey: "",
                paramValue: "",
                paramType: 1,
                remark: "",
            };
            this.resetForm("form");
        },
        open() {
            this.reset();
            this.form = Object.assign(this.form, this.row);
        },
    },
};
</script>

<style lang="scss" scoped></style>
