<template>
    <el-form ref="passForm" :model="passForm" :rules="passRules" label-width="100px">
        <el-form-item label="旧密码：" prop="origPasswd">
            <el-input
                v-model="passForm.origPasswd"
                class="input"
                placeholder="请输入旧密码"
                show-password
                auto-complete="new-password"
            />
        </el-form-item>
        <el-form-item label="新密码：" prop="newPasswd">
            <el-input
                v-model="passForm.newPasswd"
                class="input"
                placeholder="请输入新密码"
                show-password
                auto-complete="new-password"
            />
        </el-form-item>
        <el-form-item label="确认密码：" prop="password">
            <el-input
                v-model="passForm.password"
                class="input"
                placeholder="请确认密码"
                show-password
                auto-complete="new-password"
            />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" :loading="loading" @click="editPassword">保 存</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
import { user } from "@/api";

export default {
    name: "ResetPwd",
    props: {
        userId: {
            type: String,
            default: ""
        }
    },
    data() {
        const validator = (rule, value, callback) => {
            if (!value) {
                callback(new Error("用户新密码不能为空"));
            } else if (value !== this.passForm.newPasswd) {
                callback(new Error("两次输入的密码不一致"));
            } else if (this.passForm.origPasswd === this.passForm.newPasswd) {
                callback(new Error("新密码不能与旧密码相同"));
            } else {
                callback();
            }
        };
        return {
            passForm: {
                origPasswd: "",
                newPasswd: "",
                password: "",
            },
            passRules: {
                origPasswd: [{ required: true, message: "用户旧密码不能为空", trigger: "blur" }],
                newPasswd: [{ required: true, message: "用户新密码不能为空", trigger: "blur" }],
                password: [{ required: true, validator, trigger: "blur" }],
            },
            loading: false,
        }
    },
    methods: {
        editPassword() {
            this.$refs["passForm"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        await user.editpwd({ userId: this.userId, ...this.passForm });
                        this.$modal.msgSuccess(`修改成功`);
                        this.$refs["passForm"].resetFields();
                    } catch (error) {
                        console.log(error);
                    } finally {
                        this.loading = false;
                    }
                }
            });
        },
    }
}
</script>
