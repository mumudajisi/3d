<template>
    <div class="person-center">
        <el-row :gutter="10">
            <el-col :span="6" style="width: 350px">
                <el-card header="个人资料" shadow="never">
                    <div class="text-center">
                        <user-avatar :user="userForm" />
                    </div>
                    <el-descriptions class="descriptions" :column="1" border>
                        <el-descriptions-item :content-style="contentStyle">
                            <template slot="label">
                                <div class="label">
                                    <svg-icon icon-class="user" />
                                    <span>登录账号：</span>
                                </div>
                            </template>
                            <span>{{ userForm.userId }}</span>
                        </el-descriptions-item>
                        <el-descriptions-item :content-style="contentStyle">
                            <template slot="label">
                                <div class="label">
                                    <svg-icon icon-class="people" />
                                    <span>用户名称：</span>
                                </div>
                            </template>
                            <span>{{ userForm.userName }}</span>
                        </el-descriptions-item>
                        <el-descriptions-item :content-style="contentStyle">
                            <template slot="label">
                                <div class="label">
                                    <i class="el-icon-mobile" />
                                    <span>手机号码：</span>
                                </div>
                            </template>
                            <span>{{ userForm.mobile }}</span>
                        </el-descriptions-item>
                        <el-descriptions-item :content-style="contentStyle">
                            <template slot="label">
                                <div class="label">
                                    <svg-icon icon-class="email" />
                                    <span>邮箱地址：</span>
                                </div>
                            </template>
                            <span>{{ userForm.email }}</span>
                        </el-descriptions-item>
                        <el-descriptions-item :content-style="contentStyle">
                            <template slot="label">
                                <div class="label">
                                    <svg-icon icon-class="peoples" />
                                    <span>所属部门：</span>
                                </div>
                            </template>
                            <span>{{ userForm.deptName }}</span>
                        </el-descriptions-item>
                        <el-descriptions-item :content-style="contentStyle">
                            <template slot="label">
                                <div class="label">
                                    <svg-icon icon-class="date" />
                                    <span>创建时间：</span>
                                </div>
                            </template>
                            <span>{{ userForm.createTime }}</span>
                        </el-descriptions-item>
                    </el-descriptions>
                </el-card>
            </el-col>
            <el-col :span="16">
                <el-card header="基本资料" shadow="never">
                    <el-tabs v-model="activeName" type="border-card" style="box-shadow: none">
                        <el-tab-pane label="基本资料" name="first">
                            <user-info :user-data="userForm" />
                        </el-tab-pane>
                        <el-tab-pane v-if="$store.getters['userx/id'] === 'admin'" label="修改密码" name="second">
                            <reset-pwd :user-id="userForm.userId" />
                        </el-tab-pane>
                    </el-tabs>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { user } from "@/api";
import { mapGetters } from "vuex";
import ResetPwd from "@/views/user/person/reset-pwd";
import UserInfo from "@/views/user/person/user-info";
import UserAvatar from "@/views/user/person/user-avatar";

export default {
    name: "PersonCenter",
    components: { UserAvatar, UserInfo, ResetPwd },
    ...mapGetters("userx", ["avatar"]),
    data() {
        return {
            activeName: "first",
            userForm: {
                id: "",
                userName: "",
                mobile: "",
                email: "",
                sex: "1",
                avatar: this.$store.getters["userx/avatar"],
            },
            contentStyle: {
                "text-align": "right",
            },
        };
    },
    computed: {
        ...mapGetters("userx", ["id", "token"]),
        userId() {
            return this.id
        }
    },
    created() {
        this.getUserInfo();
    },
    methods: {
        async getUserInfo() {
            try {
                const { respData } = await user.getUserList({
                    userId: this.userId,
                });
                this.userForm = respData?.list[0];
            } catch (error) {
                console.log("user-person => ", error);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.person-center {
    .avatar {
        margin: 24px 0;
        display: flex;
        align-items: center;
        flex-direction: column;
    }
    .user-avatar {
        width: 126px;
        height: 126px;
        border-radius: 50%;
    }
    .edit-header {
        margin-top: 5px;
    }
    .label {
        display: flex;
        align-items: center;
        svg,
        i {
            margin-right: 5px;
            position: relative;
            top: -1px;
        }
    }
    .input {
        width: 250px;
    }
    &::v-deep {
        .descriptions {
            th,
            td {
                border-left: none;
                border-right: none;
                background-color: transparent;
            }
        }
    }
}
</style>
