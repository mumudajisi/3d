<template>
    <div class="tags-view-wrapper" @click.right.prevent>
        <ScrollPane
            ref="scrollPane"
            class="tags-view-wrapper"
            @scroll="handleScroll"
        >
            <router-link
                v-for="(tag, i) in tagViews"
                ref="tag"
                :key="tag.path"
                class="tags-view-item"
                :class="{
                    active: defaultActive === tag.path,
                    isIndex: isIndex(tag),
                }"
                :to="tag.path"
                tag="span"
                @click.native.right="handleRightClick($event, tag, i)"
            >
                <svg-icon
                    v-if="tag.icon"
                    class-name="tags-item-icon"
                    :icon-class="tag.icon"
                />
                {{ tag.name }}
                <span
                    v-if="!isIndex(tag)"
                    class="el-icon-close"
                    @click.prevent.stop="closeSelectedTag(tag, i)"
                />
            </router-link>
        </ScrollPane>
        <ul
            v-show="visible"
            :style="{ left: left + 'px', top: top + 'px' }"
            class="contextmenu"
        >
            <template v-for="(m, i) in rightMenuList">
                <li :key="i" @click="contextmenuClick(m, i)">
                    <i :class="m.icon" /> <span>{{ m.name }}</span>
                </li>
            </template>
        </ul>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import ScrollPane from "./ScrollPane.vue";
import TagsDropMenu from "./TagsDropMenu";

export default {
    components: {
        ScrollPane,
    },
    mixins: [TagsDropMenu],
    data() {
        return {
            visible: false,
            top: 0,
            left: 0,
            selectedTag: null,
        };
    },
    computed: {
        ...mapGetters("userx", ["tagViews"]),
        defaultActive() {
            return this.$route.fullPath;
        },
        isIndex() {
            return (tag) => tag.path === "/index";
        },
        rightMenuList() {
            const { selectedTag } = this;
            const list = [
                {
                    name: "刷新页面",
                    icon: "el-icon-refresh-right",
                    type: "toRefresh",
                },
            ];
            if (selectedTag?.path !== "/index") {
                list.push({
                    name: "关闭当前",
                    icon: "el-icon-close",
                    type: "closeNow",
                });
            }
            list.push({
                name: "关闭其他",
                icon: "el-icon-circle-close",
                type: "closeOther",
            });
            if (selectedTag?.index > 1) {
                list.push({
                    name: "关闭左侧",
                    icon: "el-icon-back",
                    type: "closeLeft",
                });
            }
            if (
                selectedTag?.path !== "/index" &&
                selectedTag?.index < this.tagViews?.length - 1
            ) {
                list.push({
                    name: "关闭右侧",
                    icon: "el-icon-right",
                    type: "closeRight",
                });
            }
            list.push({
                name: "全部关闭",
                icon: "el-icon-circle-close",
                type: "closeAll",
            });
            return list;
        },
    },
    watch: {
        $route: {
            immediate: true,
            handler(route, oldRoute) {
                this.addTagsMenu(route, oldRoute);
                this.moveToCurrentTag();
            },
        },
        visible(value) {
            if (value) {
                document.body.addEventListener("click", this.closeMenu);
            } else {
                document.body.removeEventListener("click", this.closeMenu);
            }
        },
    },
    methods: {
        addTagsMenu(route, oldRoute) {
            if (route.fullPath.startsWith("/redirect")) return;
            const index = this.tagViews.findIndex(
                (m) => m.path === route.fullPath
            );
            if (index !== -1) return;
            this.$store.commit("userx/SET_TAGVIEWS", [
                ...this.tagViews,
                {
                    path: route.fullPath,
                    name: route.path === "/userShow/know/info" && this.$route.query.name ? this.$route.query.name : route?.meta?.title,
                    icon: route?.meta?.icon,
                },
            ]);
        },
        handleRightClick(e, menu, i) {
            const clientWidth = document.body.clientWidth; // 屏幕 宽度
            const menuWidth = 95; // 右键菜单 宽度
            // 判断右边是否超出屏幕
            this.left =
                e.clientX + menuWidth > clientWidth
                    ? e.clientX - menuWidth
                    : e.clientX;
            this.top = e.clientY;
            this.visible = true;
            this.selectedTag = {
                ...menu,
                index: i,
            };
        },
        contextmenuClick(item, i) {
            this[item.type]?.(item, i);
        },
        closeSelectedTag(menu, i) {
            this.selectedTag = {
                ...menu,
                index: i,
            };
            this.closeNow();
            this.selectedTag = null;
        },
        moveToCurrentTag() {
            this.$nextTick(() => {
                const tags = this.$refs.tag;
                for (const tag of tags) {
                    if (tag.to === this.$route.path) {
                        this.$refs.scrollPane.moveToTarget(tag);
                        break;
                    }
                }
            });
        },
        closeMenu() {
            this.visible = false;
            this.selectedTag = null;
        },
        handleScroll() {
            this.closeMenu();
        },
    },
};
</script>

<style lang="scss" scoped src="./TagsView.scss"></style>
