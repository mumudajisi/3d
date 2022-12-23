<template>
    <el-form ref="form" :model="userData" :rules="userRules" label-width="100px">
        <el-form-item label="用户名称：" prop="userName">
            <el-input v-model="userData.userName" class="input" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="手机号码：" prop="mobile">
            <el-input v-model="userData.mobile" class="input" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="电子邮箱：" prop="email">
            <el-input v-model="userData.email" class="input" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item label="性别：" prop="sex">
            <el-radio-group v-model="userData.sex" placeholder="请选择性别" @change="changeSex">
                <el-radio label="1">男</el-radio>
                <el-radio label="0">女</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" :loading="loading" @click="submit">保 存</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
import { getAttrsByKeys } from "@/utils";
import { user } from "@/api";

export default {
    name: "UserInfo",
    props: {
        userData: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            change: false,
            userRules: {
                userName: [{ required: true, message: "用户名称不能为空", trigger: "blur" }],
            },
            loading: false
        }
    },
    methods: {
        submit() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const form = getAttrsByKeys(this.userData, "id,userName,mobile,email,sex,userId");
                        await user.updateUser(form);
                        this.$store.commit("userx/SET_USER", this.userData)
                        this.$modal.msgSuccess(`修改成功`);
                        if (!this.$store.getters["userx/custom"] && this.change) {
                            this.$store.commit("userx/SET_AVATAR", process.env.VUE_APP_AVATAR_PATH + (this.userData.sex === "1" ? "male.png" : "female.png"))
                        }
                        this.change = false
                        // 调用全局事件总线
                        this.$bus.$emit("updateAvatar")
                    } catch (error) {
                        console.log("@修改用户信息返回失败:", error.data ? error.data.respDesc : "与后端通讯失败");
                    } finally {
                        this.loading = false;
                    }
                }
            });
        },
        changeSex() {
            this.change = true
        }
    }
}
</script>
