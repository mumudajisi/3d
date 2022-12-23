<template>
    <div class="aside">
        <div v-if="$slots.place" class="current">
            <span>当前位置:</span>
            <slot name="place" />
        </div>
        <div v-if="$slots.tree" class="tree">
            <slot name="tree" />
        </div>
        <slot />
    </div>
</template>

<script>
export default {
    name: "Aisde",
    data() {
        return {};
    },
    methods: {},
};
</script>

<style lang="scss" scoped>
.aside {
    width: 340px;
    background-color: #fff;
    .current {
        width: 100%;
        height: 28px;
        line-height: 28px;
        padding: 0 5px;
        color: #006e6b;
        font-size: 14px;
    }
    .tree {
        margin: auto;
        width: 100%;
        ::v-deep {
            .el-tree {
                background-color: #fff;
                margin-top: 25px;

            }
        }
    }
}
</style>
