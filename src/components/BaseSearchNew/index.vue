<template>
    <section class="components flex-center relative">
        <el-form
            :ref="otherConfig.name || 'search'"
            :inline="true"
            :model="searchForm"
            size="mini"
            class="relative"
            @submit.native.prevent
        >
            <template v-for="(item, index) in config">
                <el-form-item
                    v-if="!item.isHide"
                    :key="item.bind + index"
                    :label="item.name"
                    :prop="item.bind"
                    :label-width="(otherConfig.labelWidth || 80) + 'px'"
                    :style="
                        'padding-left:' +
                            ((item.labelWidth || otherConfig.labelWidth || 80) - 0 + 5) +
                            'px;width:' +
                            (item.itemWidth || otherConfig.itemWidth || '32%') +
                            ';max-width:' +
                            (item.maxWidth || '500px')
                    "
                >
                    <!--text-->
                    <el-input
                        v-if="item.type === 'text'"
                        v-model="searchForm[item.bind]"
                        :readonly="item.readonly || false"
                        :placeholder="item.placeholder"
                        clearable
                        @keyup.enter.native="searchFn"
                    />
                    <!--select-->
                    <el-select
                        v-else-if="item.type === 'select'"
                        v-model="searchForm[item.bind]"
                        :placeholder="item.placeholder"
                        :multiple="item.multiple"
                        :disabled="item.disabled"
                        :clearable="item.clearable || true"
                        :collapse-tags="item.collapseTags"
                        :multiple-limit="item.multipleLimit"
                        :filterable="item.filterable !== 'false'"
                        @change="item.callBc && item.callBc(item, searchForm[item.bind])"
                    >
                        <el-option
                            v-for="op in enums[item.dataList]"
                            :key="op.dictValue"
                            :label="op.dictLabel"
                            :value="op.dictValue"
                        />
                    </el-select>
                    <!--datePicker-->
                    <el-date-picker
                        v-else-if="item.type === 'datePicker'"
                        v-model="searchForm[item.bind]"
                        :type="item.dateType"
                        :disabled="item.disabled"
                        :clearable="item.clearable"
                        :placeholder="item.placeholder"
                        :format="item.format"
                        :default-value="item.defaultValue"
                        :default-time="item.defaultTime"
                        :value-format="item.valueFormat"
                        :start-placeholder="item.startPlaceholder"
                        :end-placeholder="item.endPlaceholder"
                        @change="item.callBc && item.callBc(item, searchForm[item.bind])"
                    />

                </el-form-item>
            </template>
        </el-form>
        <div class="btn">
            <el-button type="primary" size="mini" @click="searchFn">查询</el-button>
            <el-button size="mini" @click="restSearch">重置</el-button>
        </div>
    </section>
</template>

<script>
export default {
    name: "BaseSearch",
    model: {
        prop: "form",
        event: "searchForm"
    },
    props: {
        // 绑定的所有字段	表单数据对象
        form: {
            type: Object,
            default() {
                return {}
            }
        },
        // 表单的配置项
        config: {
            type: Array,
            default() {
                return []
            }
        },
        // 其他配置项
        otherConfig: {
            type: Object,
            default() {
                return {}
            }
        },
        // 枚举数据
        enums: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            searchForm: this.form
        }
    },
    watch: {
        searchForm() {
            this.$emit("searchForm", this.searchForm)
        }
    },
    methods: {
        restSearch() {
            this.$refs[this.otherConfig.name || "search"].resetFields()
            this.$emit("queryList")
        },
        searchFn() {
            this.$emit("queryList")
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .el-form-item__label {
    padding-right: 5px;
    position: absolute;
    left: 0;
    top: 0;
}

.el-form {
    width: 100%;
    padding-right: 130px;

    .el-form-item {
        position: relative;
        margin: 6px 10px 0 0;
    }
}

::v-deep .el-form-item__content,
::v-deep .el-input,
::v-deep .el-select,
::v-deep .el-date-editor,
::v-deep .el-cascader {
    width: 100% !important;
}

.btn {
    width: 135px;
}

.btn {
    position: absolute;
    right: 5px;
    top: 27px;
}
</style>
