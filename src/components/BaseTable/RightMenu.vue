<template>
    <div class="right-menu">
        <el-popover placement="bottom-end" trigger="click" popper-class="table-menu-popver">
            <div class="right-menu-containter">
                <div class="right-menu-header">
                    <el-checkbox :value="isAllChecked" @change="togggleAll">
                        <span class="text">列展示</span>
                    </el-checkbox>
                    <el-link type="primary" :underline="false" @click="setDefaultValue">重置</el-link>
                </div>
                <div class="right-menu-main">
                    <el-scrollbar :style="`height: ${overHeight}px`">
                        <template v-for="(c, i) in data">
                            <div :key="i" class="right-menu-main-item">
                                <el-checkbox :value="!c.hidden" @change="handleChange(c, i)">
                                    <span class="text">{{ c.props.label }}</span>
                                </el-checkbox>
                            </div>
                        </template>
                    </el-scrollbar>
                </div>
            </div>
            <template #reference>
                <el-tooltip class="item" effect="dark" content="列设置" placement="top">
                    <i class="el-icon-s-tools setting" />
                </el-tooltip>
            </template>
        </el-popover>
    </div>
</template>

<script>
export default {
    name: "RightMenu",
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        isAllChecked: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {};
    },
    computed: {
        overHeight() {
            return this.data.length * 38 > 304 ? 300 : this.data.length * 38;
        },
    },
    methods: {
        togggleAll() {
            this.$emit("togggleAll");
        },
        setDefaultValue() {
            this.$emit("setDefaultValue");
        },
        handleChange(item, i) {
            item.hidden = !item.hidden;
            this.$emit("handleChange");
        },
    },
};
</script>

<style lang="scss" scoped>
.center {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.right-menu {
    height: 100%;
    position: absolute;
    right: 5px;
    top: 0;
    @extend .center;
    .setting {
        cursor: pointer;
    }
}
.right-menu-containter {
    width: 150px;
    .right-menu-header {
        padding: 8px 14px;
        font-size: 14px;
        border-bottom: 1px solid rgb(239, 239, 245);
        @extend .center;
    }
    .text {
        color: #606266;
    }
    .right-menu-main {
        &::v-deep .el-scrollbar__wrap {
            overflow-x: hidden;
        }
        .right-menu-main-item {
            width: 100%;
            height: 38px;
            padding: 10px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            &:hover {
                background-color: #e6f7ff;
            }
        }
    }
}
</style>
