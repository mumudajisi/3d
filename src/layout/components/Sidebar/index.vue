<template>
    <div class="sidebar" :class="{ collapse }">
        <div class="sidebar-header">
            <router-link to="/user/person">
                <img class="user-header" :src="avatar" alt="用户头像">
            </router-link>
            <div class="user-info">
                <div class="user-name">{{ username }}</div>
                <div class="user-status">
                    <el-link :underline="false">
                        <i class="inline" />
                        <span>在线</span>
                    </el-link>
                    <el-link :underline="false" @click="logout">
                        <svg-icon class-name="search-icon" icon-class="logout" />
                        <span>注销</span>
                    </el-link>
                </div>
            </div>
        </div>
        <div class="sidebar-main">
            <el-menu
                class="el-menu-vertical-demo"
                :collapse="collapse"
                :collapse-transition="false"
                :default-active="defaultMenuActive"
                :unique-opened="true"
                mode="vertical"
                router
            >
                <template v-for="(m, i) in menusList">
                    <MenuItem :key="i" :menu="m" />
                </template>
            </el-menu>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import MenuList from "./menu";
import MenuItem from "./MenuItem.vue";

export default {
    name: "Sidebar",
    components: {
        MenuItem,
    },
    data() {
        return {
            menus: MenuList,
        };
    },
    computed: {
        ...mapGetters(["collapse"]),
        ...mapGetters("userx", ["user", "avatar"]),
        ...mapGetters("menux", ["menusList"]),
        defaultMenuActive() {
            return this.$route.meta?.activeMenu || this.$route.path;
        },
        username() {
            return this.userInfo?.username;
        },
    },
    methods: {
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
            }).catch(() => {});
        },
    }
};
</script>

<style lang="scss" src="./Sidebar.scss" scoped></style>
