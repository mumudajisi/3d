<template>
    <div class="layout">
        <Navbar class="layout-header" />
        <Sidebar class="layout-sidebar" />
        <TagsView class="layout-tag-view" :class="{ collapse }" />
        <div class="layout-container" :class="{ collapse: collapse }">
            <div class="layout-main">
                <keep-alive>
                    <router-view />
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
import { Navbar, TagsView, Sidebar } from "./components";
import { mapGetters } from "vuex";
import { user } from "@/api";

export default {
    name: "Layout",
    components: {
        Navbar,
        TagsView,
        Sidebar,
    },
    computed: {
        ...mapGetters(["collapse"]),
        ...mapGetters("userx", ["role", "roles"]),
    },
    async created() {
        await this.getRoles();
        await this.$store.dispatch("menux/getMenuTree");
    },
    methods: {
        async getRoles() {
            try {
                const { respData } = await user.getRoles();
                await this.$store.commit("userx/SET_ROLES", respData);
                const roleIndex = this.roles.findIndex((r) => r.roleId === this.role?.roleId);
                if (!this.role && roleIndex === -1) {
                    await this.$store.commit("userx/SET_ROLE", respData[0]);
                }
            } catch (error) {
                console.log(error);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/mixin.scss";
@import "~@/assets/styles/variables.scss";

.layout {
    width: 100%;
    height: 100%;
}

.layout-header {
    width: 100%;
    position: fixed;
    top: 0;
    z-index: 200;
}

.layout-sidebar {
    position: fixed;
    left: 0;
    top: 50px;
    bottom: 0;
    z-index: 100;
}

.layout-tag-view {
    width: calc(100% - 220px);
    position: fixed;
    top: 50px;
    left: 220px;
    z-index: 200;
    margin-left: 10px;
    background-color: #fff;
    -webkit-transition: width 0.28s, left 0.28s;
    transition: width 0.28s, left 0.28s;

    &.collapse {
        width: calc(100% - 64px);
        left: 64px;
    }
}

.layout-container {
    height: 100%;
    padding-top: 84px;
    overflow-y: auto;
    padding-left: 220px;
    -webkit-transition: padding-left 0.28s;
    transition: padding-left 0.28s;

    &.collapse {
        padding-left: 64px;
    }
}

.layout-main {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    padding: 15px 20px;
    position: relative;
    z-index: 100;
}
</style>
