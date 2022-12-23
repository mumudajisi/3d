<template>
    <div class="login">
        <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
        >
            <h3 class="title">{{ $store.state.HomeTitle }}</h3>
            <el-form-item prop="username">
                <el-input
                    v-model="loginForm.username"
                    type="text"
                    auto-complete="off"
                    clearable
                    placeholder="账号"
                >
                    <svg-icon
                        slot="prefix"
                        icon-class="user"
                        class="el-input__icon input-icon"
                    />
                </el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input
                    v-model="loginForm.password"
                    type="password"
                    auto-complete="new-password"
                    placeholder="密码"
                    show-password
                    clearable
                    @keyup.enter.native="handleLogin"
                >
                    <svg-icon
                        slot="prefix"
                        icon-class="password"
                        class="el-input__icon input-icon"
                    />
                </el-input>
            </el-form-item>
            <el-checkbox
                v-model="loginForm.rememberme"
                style="margin: 0 0 25px 0"
                @change="rememberpsd"
            >记住密码</el-checkbox>
            <el-form-item class="login-btn">
                <el-button
                    :loading="loading"
                    size="medium"
                    type="primary"
                    @click.native.prevent="handleLogin"
                >
                    <span>登 录</span>
                </el-button>
                <el-button
                    size="medium"
                    type="primary"
                    @click.native.prevent="reset"
                >
                    <span>重 置</span>
                </el-button>
            </el-form-item>
        </el-form>
        <!--  底部  -->
        <div class="el-login-footer">
            <span>Copyright © 2018-2022 www.sgcc.com.cn All Rights Reserved.</span>
        </div>
    </div>
</template>

<script>

export default {
    name: "Login",
    data() {
        return {
            loginForm: {
                username: "",
                password: "",
                rememberme: false,
            },
            loginRules: {
                username: [
                    {
                        required: true,
                        trigger: "blur",
                        message: "请输入您的账号",
                    },
                ],
                password: [
                    {
                        required: true,
                        trigger: "blur",
                        message: "请输入您的密码",
                    },
                ],
            },
            loading: false,
            // 注册开关
            register: false,
            redirect: undefined,
        };
    },
    watch: {
        $route: {
            handler: function (route) {
                this.redirect = route.query && route.query.redirect;
            },
            immediate: true,
        },
    },
    mounted() {
        this.getCookie(); // 创建完成调用cookie
    },
    methods: {
        // 当记住密码复选框改变
        rememberpsd(e) {
            this.loginForm.rememberme = e;
        },
        // 保存账号密码加密至cookie
        setCookie(cname, cpwd, cdays) {
            // 获取当前时间
            var curDate = new Date();
            // 设置7天过期时间
            curDate.setTime(curDate.getTime() + 24 * 60 * 60 * 1000 * cdays);
            // 账号密码加密
            var codeName = window.btoa(unescape(encodeURIComponent(cname)));
            var codePwd = window.btoa(unescape(encodeURIComponent(cpwd)));
            // 字符串拼接cookie
            window.document.cookie = "username" + "=" + codeName + ";Expires=" + curDate.toGMTString();
            window.document.cookie = "password" + "=" + codePwd + ";Expires=" + curDate.toGMTString();
            window.document.cookie = "rememberme" + "=" + this.loginForm.rememberme + ";Expires=" + curDate.toGMTString();
        },
        // 获取cookie解密后的数据
        getCookie() {
            if (document.cookie.length > 0) {
                var arr = document.cookie.split("; ");
                for (var i = 0; i < arr.length; i++) {
                    var arr2 = arr[i].split("=");
                    if (arr2[0] === "username") {
                        // 账号解密赋值
                        this.loginForm.username = decodeURIComponent(escape(window.atob(arr2[1]))
                        );
                    } else if (arr2[0] === "password") {
                        // 密码解密赋值
                        this.loginForm.password = decodeURIComponent(escape(window.atob(arr2[1]))
                        );
                    } else if (arr2[0] === "rememberme") {
                        // 获取复选框状态
                        this.loginForm.rememberme = JSON.parse(arr2[1]);
                    }
                }
            }
        },
        // 清除cookie
        clearCookie() {
            this.setCookie("", "", -1);
        },
        handleLogin() {
            this.$refs.loginForm.validate(async (valid) => {
                try {
                    if (valid) {
                        // if (this.loginForm.username !== "admin") {
                        //     this.$message.error("非法登录")
                        //     return false
                        // }
                        this.loading = true;
                        await this.$store.dispatch("userx/login", this.loginForm);
                        await this.$router.push({ path: this.redirect || "/" });
                        if (this.loginForm.rememberme === true) {
                            this.setCookie(this.loginForm.username, this.loginForm.password, 7);
                        } else {
                            this.clearCookie()
                        }
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    this.loading = false;
                }
            });
        },
        reset() {
            this.$refs.loginForm.resetFields();
        },
    },
};
</script>

<style rel="stylesheet/scss" lang="scss">
    .login {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        min-height: 350px;
        background-image: url("../assets/images/login-background.jpg");
        /* 背景图垂直、水平均居中 */
        background-position: center center;
        /* 背景图不平铺 */
        background-repeat: no-repeat;
        /* 当内容高度大于图片高度时，背景图像的位置相对于viewport固定 */
        background-attachment: fixed;
        /* 让背景图基于容器大小伸缩 */
        background-size: cover;
    }
    .title {
        margin: 0 auto 30px auto;
        text-align: center;
        color: #707070;
    }

    .login-form {
        border-radius: 6px;
        background: rgba($color: #fff, $alpha: 0.4);
        width: 400px;
        padding: 25px 25px 5px 25px;
        .el-input {
            height: 38px;
            input {
                height: 38px;
            }
        }
        .input-icon {
            height: 39px;
            width: 14px;
            margin-left: 2px;
        }
        .login-btn {
            width: 100%;
            .el-form-item__content {
                width: 100%;
                display: flex;
                justify-content: space-around;
            }
        }
    }
    .login-tip {
        font-size: 13px;
        text-align: center;
        color: #bfbfbf;
    }
    .login-code {
        width: 33%;
        height: 38px;
        float: right;
        img {
            cursor: pointer;
            vertical-align: middle;
        }
    }
    .el-login-footer {
        height: 40px;
        line-height: 40px;
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
        color: #fff;
        font-family: Arial,serif;
        font-size: 12px;
        letter-spacing: 1px;
    }
    .login-code-img {
        height: 38px;
    }
</style>
