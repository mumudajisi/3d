<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}岗位`" width="500px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="岗位名称" prop="postName">
                <el-input v-model="form.postName" placeholder="请输入岗位名称" />
            </el-form-item>
            <el-form-item label="岗位编码" prop="postCode">
                <el-input v-model="form.postCode" placeholder="请输入编码名称" />
            </el-form-item>
            <el-form-item label="岗位顺序" prop="sortNo">
                <el-input-number v-model="form.sortNo" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="岗位状态" prop="status">
                <el-radio-group v-model="form.status">
                    <el-radio :label="1">正常</el-radio>
                    <el-radio :label="0">停用</el-radio>
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
import { post } from "@/api";

export default {
    name: "PostManage",
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
                postId: "",
                postCode: "",
                postName: "",
                sortNo: 0,
                remark: "",
                status: 1,
            },
            roleList: [],
            postList: [],
            rules: {
                postName: [{ required: true, message: "岗位名称不能为空", trigger: "blur" }],
                postCode: [{ required: true, message: "岗位编码不能为空", trigger: "blur" }],
                sortNo: [{ required: true, message: "岗位顺序不能为空", trigger: "blur" }],
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
                        const { postId, ...otherForm } = this.form;
                        if (this.type === "add") {
                            await post.addPost(otherForm);
                        } else {
                            await post.updatePost({ postId, ...otherForm });
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
                postId: "",
                postCode: "",
                postName: "",
                sortNo: 0,
                remark: "",
                status: 1,
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
