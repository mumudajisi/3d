<template>
    <div class="hint-table">
        <div class="table-header">{{ title }}</div>
        <el-table :data="data" height="170px" stripe :show-header="false">
            <template v-for="(c, i) in column">
                <el-table-column :key="i" v-bind="c" />
            </template>
        </el-table>
    </div>
</template>

<script>
export default {
    name: "HintTable",
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        column: {
            type: Array,
            default: () => [],
        },
        title: {
            type: String,
            default: "",
        },
    },
    data() {
        return {};
    },
    methods: {},
};
</script>

<style lang="scss" scoped>
.hint-table {
    border: 1px solid rgb(219, 219, 219);
}
.table-header {
    height: 36px;
    line-height: 36px;
    padding: 0 8px;
    font-size: 14px;
    background-color: rgb(225, 227, 230);
}
.hint-table::v-deep {
    .el-table {
        width: 100%;
        .el-table__header-wrapper table,
        .el-table__body-wrapper table {
            width: 100% !important;
        }
        .el-table__body,
        .el-table__footer,
        .el-table__header {
            table-layout: auto;
        }
    }
    .el-table__cell {
        padding: 5px 0;
    }
    .el-table__row--striped .el-table__cell {
        background-color: rgb(242, 242, 242);
    }
}
</style>
