<template>
    <div class="tree-search">
        <el-input v-model="searchKey" :placeholder="placeholder" :clearable="clearable" size="small" />
        <el-tree
            ref="tree"
            class="tree"
            v-bind="$attrs"
            :data="data"
            :indent="indent"
            :props="defaultProps"
            :expand-on-click-node="expandOnClickNode"
            :filter-node-method="filterNode"
            v-on="$listeners"
        />
    </div>
</template>

<script>
export default {
    name: "TreeSearch",
    inheritAttrs: false,
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        props: {
            type: Object,
            default: () => ({}),
        },
        indent: {
            type: Number,
            default: 20,
        },
        expandOnClickNode: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String,
            default: "搜索类型",
        },
        clearable: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            searchKey: "",
        };
    },
    computed: {
        defaultProps() {
            return {
                label: "label",
                children: "children",
                ...this.props,
            };
        },
    },
    watch: {
        searchKey(val) {
            this.$refs.tree.filter(val);
        },
    },
    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return data[this.defaultProps.label].indexOf(value) !== -1;
        },
        clearChoseStyle() {
            const select = this.$refs["tree"].$el.querySelector(".is-current");
            if (select) {
                select.classList.remove("is-current");
            }
        }
    },
};
</script>

<style lang="scss" scoped>
.tree-search {
    width: 100%;

}
.tree {
    margin-top: 5px;
    margin-bottom: 50px;
    background-color: transparent;
    ::v-deep {
        .el-tree-node__expand-icon:not(.is-leaf),
        .el-tree-node__label {
            color: #415058;
        }
        .el-tree-node.is-current > .el-tree-node__content {
            .el-tree-node__label {
                color: #1683fa !important;
            }
        }
    }
}
</style>
