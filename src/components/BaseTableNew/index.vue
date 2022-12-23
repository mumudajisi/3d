<template>
    <section class="components">
        <div
            v-if="tableConfig.outerBtn"
            :class="['mb-20', otherConfig.btnAlign === 'right' ? 'fl-r' : '']"
        >
            <template v-for="(oBtn, i) in tableConfig.outerBtn">
                <el-button
                    v-if="isShowBtn(oBtn, oBtn)"
                    :key="i"
                    size="mini"
                    :icon="oBtn.icon"
                    :type="oBtn.type || 'primary'"
                    @click="callFn(oBtn)"
                >
                    {{ oBtn.name }}
                </el-button>
            </template>
        </div>
        <div class="box">
            <el-table
                ref="table"
                style="width: 100%"
                :data="tableData"
                :max-height="maxHeight"
                :stripe="otherConfig.stripe || true"
                :border="otherConfig.border"
                :size="otherConfig.size || 'small'"
                :fit="otherConfig.fit"
                :show-header="otherConfig.showHeader"
                :highlight-current-row="otherConfig.highlightCurrentRow"
                :row-key="otherConfig.rowKey || 'id'"
                :empty-text="otherConfig.emptyText"
                :default-expand-all="otherConfig.defaultExpandAll"
                :tooltip-effect="otherConfig.tooltipEffect || 'dark'"
                :show-summary="otherConfig.showSummary"
                :sum-text="otherConfig.sumText"
                :summary-method="otherConfig.summaryMethod"
                :span-method="otherConfig.spanMethod"
                :tree-props="otherConfig.treeProps"
                :indent="otherConfig.indent"
                :lazy="otherConfig.lazy"
                :load="otherConfig.load"
                @select="selectData"
                @select-all="selectAll"
            >
                <!--多选-->
                <el-table-column
                    v-if="otherConfig.selection"
                    type="selection"
                    align="center"
                    fixed="left"
                    width="55"
                />
                <!--序号-->
                <el-table-column
                    v-if="otherConfig.index"
                    :label="otherConfig.index"
                    type="index"
                    align="center"
                    fixed="left"
                    width="55"
                />
                <!--表格数据-->
                <el-table-column
                    v-for="(item, index) in headerList.filter(
                        (val) => val.hidden === false,
                    )"
                    :key="index"
                    :prop="item.prop"
                    :label="item.name"
                    :width="item.width"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">
                        <slot
                            v-if="item.cellSlot"
                            :name="item.slotName || item.cellSlot"
                            :scope="{ row: scope.row, item: item }"
                        />
                        <span v-else-if="item.type === 'textHtml'">
                            {{ filterDict(scope.row, item.prop) }}
                        </span>
                        <span v-else-if="item.type === 'html'" v-html="scope.row[item.prop]" />
                        <Icon
                            v-else-if="item.type === 'icon'"
                            :icon="scope.row[item.prop]"
                        />
                        <div v-else-if="item.type === 'img'">
                            <img class="width-100" :src="scope.row[item.prop]" alt="">
                        </div>
                        <el-switch
                            v-else-if="item.type === 'switch'"
                            v-model="scope.row[item.prop]"
                            :active-color="item.activeColor || ''"
                            :inactive-color="item.inactiveColor || ''"
                            :active-value="item.activeValue"
                            :inactive-value="item.inactiveValue"
                            @change="item.change($event, scope.row)"
                        />
                        <span v-else>
                            {{ scope.row[item.prop] || scope.row[item.prop] === 0 ? scope.row[item.prop].toString() : '--' }}
                        </span>
                    </template>
                </el-table-column>
                <!--操作列-->
                <el-table-column
                    v-if="tableConfig.innerBtn"
                    :label="otherConfig.innerBtnLabel || '操作'"
                    :width="otherConfig.innerBtnWidth || 180"
                    align="center"
                    fixed="right"
                >
                    <template slot-scope="scope">
                        <template v-for="(btn, inx) in tableConfig.innerBtn">
                            <el-button
                                v-if="isShowBtn(btn, scope.row)"
                                :key="inx"
                                size="mini"
                                type="text"
                                :icon="btn.icon"
                                @click="callFn(btn, scope.row, btn.name, scope.$index)"
                            >
                                {{ btn.name }}
                            </el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
            <RightMenu
                v-if="otherConfig.isShowRightMenu !== 'false'"
                class="right-menu"
                :data="headerList"
                :is-all-checked="isAllChecked"
                @toggleAll="toggleAll"
                @setDefaultValue="setDefaultValue"
                @handleChange="doLayout"
            />
        </div>
        <!--分页-->
        <div v-if="tablePage" class="fl-r page">
            <el-pagination
                background
                :current-page="tablePage.page"
                :page-size="tablePage.size || 10"
                :page-sizes="tablePage.pageSizes || [10, 20, 30, 40]"
                :pager-count="5"
                layout="total, sizes, prev, pager, next, jumper"
                :total="tablePage.total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </section>
</template>

<script>
import Icon from "@/components/Icon/Icon"
import RightMenu from "@/components/BaseTableNew/RightMenu"

export default {
    name: "BaseTable",
    components: { Icon, RightMenu },
    props: {
        // 表格数据
        tableData: {
            type: Array,
            default() {
                return []
            }
        },
        // 表格的配置项
        tableConfig: {
            type: Object,
            default() {
                return {}
            }
        },
        // 表格其他的配置项
        otherConfig: {
            type: Object,
            default() {
                return {}
            }
        },
        // 表格分页
        tablePage: {
            type: Object,
            default() {
                return null
            }
        },
        // 最大高度
        maxHeight: {
            type: [String, Number],
            default() {
                return 1000
            }
        },
        // 过滤的方法
        // eslint-disable-next-line vue/require-default-prop
        formatter: {
            type: Function
        }
    },
    data() {
        return {
            headerList: [],
            num: 1
        }
    },
    computed: {
        isAllChecked() {
            return this.headerList.every((e) => !e.hidden)
        }
    },
    mounted() {
        this.setDefaultValue()
    },
    methods: {
        // 是否显示按钮
        isShowBtn(item, row) {
            const role = this.$getRoleBtn(item.code || "")
            let validate = true
            if (item.validate) {
                validate = item.validate(item, row)
            }
            return role && validate
        },
        // 预处理是否展示列
        setDefaultValue() {
            const list = []
            this.tableConfig?.header?.forEach((item) => {
                list.push({
                    hidden: item.hidden || false,
                    ...item
                })
            })
            this.headerList = list
            this.doLayout()
        },
        // 设置列的全选或全不选
        toggleAll(val) {
            const list = []
            this.headerList.forEach((item) => {
                item.hidden = !val
                list.push(item)
            })
            this.headerList = list
            this.doLayout()
        },
        doLayout() {
            this.$nextTick(() => {
                this.$refs.table?.doLayout?.()
            })
        },
        // 点击复选框选择数据
        selectData(arr) {
            this.$emit("selected", arr)
        },
        // 点击全选
        selectAll(arr) {
            this.$emit("selected", arr)
        },
        // 下一页
        handleCurrentChange(page) {
            this.$emit("pageChanged", page)
        },
        // 分页大小
        handleSizeChange(size) {
            this.$emit("sizeChanged", size)
        },
        // 操作事件
        callFn(item, row, name, index) {
            // 兼容
            if (item.method && item.method.constructor === Function) {
                item.method(item, row, name, index)
                return
            }

            const sum = 0
            const obj = this.getDeepMethod(this.$parent, item.method, sum, 10)
            if (obj.parent && obj.method) {
                obj.method.call(obj.parent, row, name, index)
            }
        },
        // 查找操作父组件的方法
        getDeepMethod(parent, method, sum, limit) {
            sum++
            if (!parent) {
                console.log("父组件没有写这个方法")
                return {}
            } else if (sum === limit) {
                console.log("父组件没有写这个方法")
                return {}
            } else if (parent[method]) {
                return { parent, method: parent[method] }
            } else {
                return this.getDeepMethod(parent.$parent, method, sum, limit)
            }
        },
        // 根据传过来的数据展示对应的值
        filterDict(row, column, value) {
            if (this.formatter) {
                const v = this.formatter(column, value, row)
                if (v) return v
            }
            return value
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .el-button [class*="el-icon-"] + span {
    margin-left: 0 !important;
}

// 修改高亮当前行颜色
::v-deep .el-table tbody tr:hover > td {
    background: #c8d9ec !important;
}

::v-deep .el-table__fixed-right {
    right: 0 !important;
}

.page {
    margin: 20px 0 0;
}

.box {
    position: relative;

    .right-menu {
        z-index: 3;
        height: 40px;
    }
}
</style>
