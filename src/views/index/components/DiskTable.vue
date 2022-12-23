<template>
    <div class="disk-table">
        <div class="table-header">磁盘状态</div>
        <div class="table-container">
            <el-table :data="data">
                <slot />
            </el-table>
        </div>
    </div>
</template>

<script>
export default {
    name: "DiskTable",
    props: {
        data: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {};
    },
    methods: {},
};
</script>

<style lang="scss" scoped>
.disk-table {
    width: 100%;
    border: 1px solid rgb(219, 219, 219);
}
.table-header {
    height: 36px;
    line-height: 36px;
    padding: 0 8px;
    font-size: 14px;
    border-bottom: 1px solid rgb(219, 219, 219);
}
.table-container {
    padding: 15px;
}
.disk-table::v-deep {
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
    .el-table__header-wrapper {
        .el-table__cell {
            background-color: transparent;
        }
    }
}
</style>
