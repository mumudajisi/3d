/**
 * tags 右键菜单操作
 */
const BaseMenu = [{ path: "/index", name: "首页", icon: "index" }];

export default {
    methods: {
        setMenuList(value) {
            this.$store.commit("userx/SET_TAGVIEWS", value);
        },
        toRefresh() {
            this.$router.replace({
                path: "/redirect" + this.$route.fullPath,
            });
        },
        closeNow() {
            const { selectedTag, tagViews } = this;
            if (this.$route.fullPath === selectedTag.path) {
                this.$router.push(
                    tagViews[
                        selectedTag.index > tagViews.length - 2
                            ? selectedTag.index - 1
                            : selectedTag.index + 1
                    ].path
                );
            }
            this.setMenuList([
                ...tagViews.slice(0, selectedTag.index),
                ...tagViews.slice(selectedTag.index + 1),
            ]);
        },
        closeOther() {
            const { selectedTag } = this;
            const currentPath = this.$route.path;
            if (selectedTag.path === "/index") {
                this.closeAll();
                return;
            }
            if (currentPath !== "/index" && currentPath !== selectedTag.path) {
                this.$router.push(selectedTag.path);
            }
            this.setMenuList([
                ...BaseMenu,
                {
                    path: selectedTag.path,
                    name: selectedTag.name,
                    icon: selectedTag.icon || "",
                },
            ]);
        },
        closeLeft() {
            const { selectedTag, tagViews } = this;
            const currentIndex = tagViews.findIndex(
                (m) => m.path === this.$route.fullPath
            );
            if (
                this.$route.path !== "/index" &&
                currentIndex < selectedTag.index
            ) {
                this.$router.push(selectedTag.path);
            }
            this.setMenuList([
                ...BaseMenu,
                ...tagViews.slice(selectedTag.index),
            ]);
        },
        closeRight() {
            const { selectedTag, tagViews } = this;
            const currentIndex = tagViews.findIndex(
                (m) => m.path === this.$route.fullPath
            );
            if (
                this.$route.path !== "/index" &&
                currentIndex > selectedTag.index
            ) {
                this.$router.push(selectedTag.path);
            }
            this.setMenuList(tagViews.slice(0, selectedTag.index + 1));
        },
        closeAll() {
            this.$router.push("/index");
            this.setMenuList(BaseMenu);
        },
    },
};
