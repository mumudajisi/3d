<template>
    <div v-if="!menu.hidden">
        <template v-if="isSubMenu">
            <el-submenu :index="path">
                <template slot="title">
                    <SvgMenuItem :icon="icon" :title="name" />
                    <!-- <span slot="title">{{ name }}</span> -->
                </template>
                <template v-for="(s, i) in children">
                    <MenuItem :key="i" :parent-path="path" :menu="s" />
                </template>
            </el-submenu>
        </template>
        <template v-else>
            <el-menu-item :index="path">
                <SvgMenuItem :icon="icon" :title="name" />
                <!-- <span slot="title">{{ name }}</span> -->
            </el-menu-item>
        </template>
    </div>
</template>

<script>
import SvgMenuItem from "./SvgMenuItem";

export default {
    name: "MenuItem",
    components: {
        SvgMenuItem,
    },
    props: {
        menu: {
            type: Object,
            default: () => ({}),
        },
        parentPath: {
            type: String,
            default: "",
        },
    },
    data() {
        return {};
    },
    computed: {
        isSubMenu() {
            const arr = []
            this.menu?.children?.forEach((item) => {
                if (item.hidden) {
                    arr.push(item)
                }
            });
            return this.menu?.children?.length > 0 && this.menu?.children?.length !== arr.length;
        },
        path() {
            return this.parentPath + this.menu?.path;
        },
        name() {
            return this.menu?.menuName;
        },
        children() {
            return this.menu?.children || [];
        },
        icon() {
            return this.menu?.icon;
        },
    },
    methods: {},
};
</script>

<style lang="scss" scoped></style>
