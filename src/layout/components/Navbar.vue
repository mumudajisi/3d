<template>
    <div class="navbar">
        <div class="logo">{{ $store.state.HomeTitle }}</div>
        <hamburger id="hamburger-container" :is-active="!collapse" class="hamburger-container" @toggleClick="toggleCollapse" />
        <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
        <div class="right-menu">
            <el-dropdown placement="bottom" trigger="click">
                <div class="user-roles">
                    <span class="user-name">{{ roleName }}</span>
                    <i class="el-icon-caret-bottom" />
                </div>
                <el-dropdown-menu slot="dropdown">
                    <template v-for="(r, i) in roles">
                        <el-dropdown-item :key="i" @click.native="choseRole(r, i)">{{ r.roleName }}</el-dropdown-item>
                    </template>
                </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
                <div class="avatar-wrapper">
                    <img :src="avatar" class="user-avatar" alt="头部图片">
                    <span class="user-name">{{ userName }}</span>
                    <i class="el-icon-caret-bottom" />
                </div>
                <el-dropdown-menu slot="dropdown">
                    <router-link :to="{name:'PersonCenter'}">
                        <el-dropdown-item>个人中心</el-dropdown-item>
                    </router-link>
                    <router-link v-if="$store.getters['userx/id'] === 'admin'" :to="{name:'PersonCenter'}">
                        <el-dropdown-item>修改密码</el-dropdown-item>
                    </router-link>
                    <el-dropdown-item divided @click.native="logout">
                        <span>退出登录</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import Hamburger from "@/components/Hamburger";
import Breadcrumb from "@/components/Breadcrumb";

export default {
    components: {
        Hamburger,
        Breadcrumb,
    },
    computed: {
        ...mapGetters(["collapse"]),
        ...mapGetters("userx", ["roles", "role", "user", "avatar"]),
        topNav: {
            get() {
                return this.$store.state.settings.topNav;
            },
        },
        roleName() {
            return this.role?.roleName || "";
        },
        userName() {
            return this.user?.userName || this.user?.userId;
        },
    },
    methods: {
        toggleCollapse() {
            this.$store.dispatch("toggleCollapse");
        },
        async choseRole(role) {
            await this.$store.commit("userx/SET_ROLE", role);
            await this.$store.dispatch("menux/getMenuTree");
            await this.$store.commit("userx/SET_TAGVIEWS", [{ path: "/index", name: "首页", icon: "index" }]);
            await this.$router.push("/index")
        },
        logout() {
            this.$confirm("确定注销并退出系统吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const isAdmin = this.$store.getters["userx/id"] === "admin"
                this.$store.dispatch("userx/logout").then(() => {
                    location.href = isAdmin ? "/login" : process.env.VUE_APP_THIRD_LOGIN;
                });
            }).catch(() => {
            });
        },
    }
};
</script>

<style lang="scss" scoped>
.navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    color: #fff;
    background: rgb(0, 110, 107);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    .logo {
        width: 220px;
        height: 100%;
        text-align: center;
        line-height: 50px;
        float: left;
        font-size: 18px;
    }

    .hamburger-container {
        line-height: 46px;
        height: 100%;
        float: left;
        padding: 0 10px !important;
        cursor: pointer;
        transition: background 0.3s;
        -webkit-tap-highlight-color: transparent;

        &:hover {
            background: rgba(0, 0, 0, 0.025);
        }
    }

    .breadcrumb-container {
        float: left;
    }

    .right-menu {
        float: right;
        height: 100%;
        line-height: 50px;
        display: flex;
        align-items: center;

        &:focus {
            outline: none;
        }

        .right-menu-item {
            display: inline-block;
            padding: 0 8px;
            height: 100%;
            font-size: 18px;
            color: #5a5e66;
            vertical-align: text-bottom;

            &.hover-effect {
                cursor: pointer;
                transition: background 0.3s;

                &:hover {
                    background: rgba(0, 0, 0, 0.05);
                }
            }
        }

        .user-roles {
            color: #fff;
            cursor: pointer;
        }

        .avatar-container {
            margin-left: 30px;
            margin-right: 30px;

            .avatar-wrapper {
                position: relative;
                color: #fff;
                display: flex;
                align-items: center;

                & > *:not(:first-child) {
                    margin-left: 10px;
                }

                .user-avatar {
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                }

                .user-name {
                    font-size: 14px;
                }

                .el-icon-caret-bottom {
                    cursor: pointer;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>
