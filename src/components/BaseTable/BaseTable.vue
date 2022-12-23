<template>
    <div class="base-table">
        <el-table v-if="isShowTable" ref="baseTable" size="custom" v-bind="$attrs" v-on="$listeners">
            <template v-for="c in baseColumns">
                <el-table-column :key="c.id" v-bind="c.props">
                    <template v-if="c.render" #default="data">
                        <Render :h="c.render" :data="[data]" />
                    </template>
                    <template #header="data">
                        <template v-if="c.id === lastBaseId">
                            <Render :h="c.setRender" :data="[data]" />
                        </template>
                        <template v-else>
                            <Render :h="c.headerRender" :data="[data]" />
                        </template>
                    </template>
                </el-table-column>
            </template>
        </el-table>
        <RightMenu
            v-if="isShowRightMenu"
            class="right-menu"
            :data="rightMenuList"
            :is-all-checked="isAllChecked"
            @togggleAll="togggleAll"
            @setDefaultValue="setDefaultValue"
            @handleChange="doLayout"
        />
    </div>
</template>

<script>
import Render from "../Render/Render.vue";
import RightMenu from "./RightMenu.vue";
import { mapGetters } from "vuex";

/**
 * 不支持 多级表头 单元格合并
 */

export default {
    name: "BaseTable",
    components: {
        Render,
        RightMenu,
    },
    inheritAttrs: false,
    props: {
        columns: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            columnsFlags: [],
            hidden: true,
            isShowTable: true,
        };
    },
    computed: {
        ...mapGetters(["collapse"]),
        lastBaseId() {
            if (this.baseColumns?.length <= 0) return;
            return this.baseColumns[this.baseColumns.length - 1].id;
        },
        baseColumns() {
            return this.columnsFlags.filter((c) => !c.hidden);
        },
        isAllChecked() {
            return this.columnsFlags.every((e) => !e.hidden);
        },
        isShowRightMenu() {
            if (this.columnsFlags?.length <= 0) return;
            return !("type" in this.columnsFlags[this.columnsFlags?.length - 1].props) && this.rightMenuList.every((e) => e.hidden);
        },
        rightMenuList() {
            return this.columnsFlags.filter((c) => !("type" in c.props));
        },
    },
    watch: {
        columns: {
            immediate: true,
            handler() {
                this.setDefaultValue();
            },
        },
        collapse() {
            this.doLayout();
        },
    },
    methods: {
        doLayout() {
            this.$nextTick(() => {
                this.$refs.baseTable?.doLayout?.();
            });
        },
        getHeaderRener(label, oldValue) {
            return (h) => {
                return h("div", { style: "position: relative;" }, [
                    oldValue || h("span", label),
                    h(RightMenu, {
                        style: "font-size: 16px;",
                        props: {
                            data: this.rightMenuList,
                            isAllChecked: this.isAllChecked,
                        },
                        on: {
                            togggleAll: () => this.togggleAll(),
                            setDefaultValue: () => this.setDefaultValue(),
                            handleChange: () => this.doLayout(),
                        },
                    }),
                ]);
            };
        },
        setDefaultValue() {
            const list = [];
            this.columns.forEach(({ render, headerRender, ...props }, index) => {
                list.push({
                    id: index,
                    render,
                    headerRender: headerRender || ((h) => h("span", props.label)),
                    props,
                    hidden: props.hidden || false,
                    setRender: this.getHeaderRener(props.label, headerRender),
                });
            });
            this.columnsFlags = list;
            this.doLayout();
        },
        togggleAll() {
            const flag = this.columnsFlags.every((e) => !e.hidden);
            this.columnsFlags.forEach((item) => {
                if (!("type" in item.props)) item.hidden = flag;
            });
            this.doLayout();
        },
    },
};
</script>

<style lang="scss" scoped>
.base-table {
    width: 100%;
    min-height: 44px;
    position: relative;
}
.right-menu {
    width: 40px;
    height: 40px;
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
        // .el-table__body,
        // .el-table__footer,
        // .el-table__header {
        //     table-layout: auto;
        // }
    }
    .el-table__header-wrapper,
    .el-table__fixed,
    .el-table__fixed-right {
        .el-table__cell {
            background-color: transparent;
        }
    }
    .el-table--custom .el-table__cell {
        padding: 8px 0;
    }
}
</style>
<style lang="scss">
.table-menu-popver {
    padding: 0;
}
</style>
