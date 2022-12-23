<script>
import Render from "../Render/Render.vue";
import RightMenu from "./RightMenu.vue";
import { mapGetters } from "vuex";

/**
 * 不支持 多级表头 单元格合并
 */

export default {
    name: "BasicTable",
    components: {
        Render,
        RightMenu,
    },
    inheritAttrs: false,
    data() {
        return {
            baseColumns: [],
            hidden: true,
            isShowTable: true,
        };
    },
    computed: {
        ...mapGetters(["collapse"]),
        lastBaseId() {
            if (this.columns?.length <= 0) return;
            return this.columns[this.columns.length - 1].id;
        },
        columns() {
            return this.baseColumns.filter((c) => !c.hidden);
        },
        rightMenuList() {
            return this.baseColumns.filter((c) => !("type" in c.props));
        },
        isAllChecked() {
            return this.baseColumns.every((e) => !e.hidden);
        },
        isShowRightMenu() {
            if (this.baseColumns?.length <= 0) return;
            return !("type" in this.baseColumns[this.baseColumns?.length - 1].props) && this.rightMenuList.every((e) => e.hidden);
        },
    },
    watch: {
        collapse() {
            this.doLayout();
        },
    },
    created() {
        this.setDefaultValue();
    },
    methods: {
        doLayout() {
            this.$nextTick(() => {
                this.$refs["baseTable"]?.doLayout?.();
            });
        },
        setDefaultValue() {
            const list = [];
            (this.$slots?.default || []).forEach((item, i) => {
                if (item?.componentOptions?.tag === "el-table-column") {
                    list.push({
                        id: i,
                        props: {
                            ...(item?.componentOptions?.propsData || {}),
                        },
                        hidden: item?.data?.attrs?.hidden || false,
                        slot: item?.componentOptions?.children,
                        scopedSlots: item?.data?.scopedSlots,
                    });
                }
            });
            this.baseColumns = list;
            this.doLayout();
        },
        togggleAll() {
            const flag = this.baseColumns.every((e) => !e.hidden);
            this.baseColumns.forEach((item) => {
                if (!("type" in item.props)) item.hidden = flag;
            });
            this.doLayout();
        },
    },
    render(h) {
        const rightMenuEvent = {
            props: {
                data: this.rightMenuList,
                isAllChecked: this.isAllChecked,
            },
            on: {
                togggleAll: () => this.togggleAll(),
                setDefaultValue: () => this.setDefaultValue(),
                handleChange: () => this.doLayout(),
            },
        };
        return h("div", { class: "base-table" }, [
            h(
                "el-table",
                {
                    props: { size: "custom", ...this.$attrs },
                    ref: "baseTable",
                    on: {
                        ...this.$listeners,
                    },
                },
                this.columns.map((item) => {
                    return h("el-table-column", {
                        props: { ...item.props },
                        key: item.id,
                        scopedSlots: {
                            default: item.slot ? () => item.slot : item.scopedSlots?.default ? item.scopedSlots?.default : undefined,
                            header: (data) => {
                                const header = item.scopedSlots?.header ? item.scopedSlots?.header(data) : h("span", data.column.label || "");
                                if (item.id === this.lastBaseId) {
                                    return [header, h(RightMenu, { style: "font-size: 16px;", ...rightMenuEvent })];
                                }
                                return header;
                            },
                        },
                    });
                })
            ),
            this.isShowRightMenu ? h("RightMenu", { class: "base-table-right-menu", ...rightMenuEvent }) : null,
        ]);
    },
};
</script>

<style lang="scss" scoped>
.base-table {
    width: 100%;
    min-height: 44px;
    position: relative;
}
.base-table-right-menu {
    display: flex;
    align-items: center;
    justify-content: center;
}
.base-table::v-deep {
    .el-table {
        width: 100% !important;
        .el-table__header-wrapper table,
        .el-table__body-wrapper table {
            width: 100% !important;
        }
        &.el-table--custom .el-table__cell {
            padding: 8px 0;
            position: relative;
        }
    }
    .el-table__header-wrapper,
    .el-table__fixed,
    .el-table__fixed-right {
        .el-table__cell {
            background-color: transparent;
        }
    }
}
</style>
<style lang="scss">
.table-menu-popver {
    padding: 0;
}
</style>
