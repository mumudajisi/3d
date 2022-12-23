<template>
    <div class="app-container">
        <div class="tree-container" />
        <div class="table">
            <BaseSearch
                v-model="search.data"
                :config="search.config"
                :enums="search.enums"
                :other-config="search.otherConfig"
                @queryList="getList"
            />
            <BaseTable
                :formatter="formatter"
                :other-config="table.otherConfig"
                :table-config="table.config"
                :table-data="table.data"
                :table-page="table.page"
                @pageChanged="pageChanged"
                @selected="selected"
                @sizeChanged="sizeChanged"
            />
            <AddPaper
                v-if="dialogVisible"
                :row="row"
                :hide-dialog="
                    () => (dialogVisible = false)"
                :title="title"
                @success="getList"
            />
        </div>
    </div>
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew";
import BaseTable from "@/components/BaseTableNew";
import AddPaper from "./addPaper"
// import dicApi from "@/api/dict";
import bankApi from "@/api/bank"
export default {
    name: "ExampleIndex",
    components: {
        BaseSearch,
        BaseTable,
        AddPaper
    },
    data() {
        return {
            title: "add",
            defaultExpandKeys: ["320000"],
            row: null,
            sels: [], // 多选框数据
            dialogVisible: false,
            resourceTypeList: [],
            search: {
                otherConfig: {
                    labelWidth: 70,
                },
                config: [
                    {
                        type: "text",
                        name: "题库名称",
                        placeholder: "请输入题库名称",
                        itemWidth: "350px",
                        bind: "bankName",
                    }
                ],
                data: {
                    major: "0", // 专业
                    bankCode: "", // 题库代码
                    subMajor: "", // 题库类型
                    bankName: "", // 题库名称
                    parentId: "", // 题库代码

                },
                enums: {
                    radioList: [], // 专业名称
                    codeList: [], // 题库代码
                    styleList: [] // 题库类型
                },
            },
            table: {
                data: [],
                config: {
                    header: [
                        {
                            type: "text",
                            prop: "bankName",
                            name: "题库名称"
                        },
                        {
                            type: "text",
                            prop: "bankCode",
                            name: "题库代码"
                        },
                        {
                            type: "text",
                            prop: "createTime",
                            name: "创建时间",
                        },
                    ],
                    outerBtn: [
                        {
                            name: "新增",
                            method: "add",
                            icon: "el-icon-plus",
                            code: "bank/add",
                        },
                        {
                            name: "批量删除",
                            method: "deleteChoose",
                            icon: "el-icon-delete",
                            code: "bank/delete",
                            type: "danger",
                        },
                    ],
                    innerBtn: [
                        {
                            name: "数据",
                            method: "detail",
                            icon: "el-icon-s-promotion",
                            code: "bank/detail",
                        },
                        {
                            name: "编辑",
                            method: "edit",
                            icon: "el-icon-edit",
                            code: "bank/edit",
                        },
                        {
                            name: "删除",
                            method: "delete",
                            icon: "el-icon-delete",
                            code: "bank/delete",
                        },
                    ],
                },
                otherConfig: {
                    rowKey: "id", // 行数据的 Key
                    selection: true, // 是否展示多选
                    index: "序号", // 是否显示序号
                },
                page: {
                    pageNum: 0, // 当前页,第几页
                    size: 10, // 每页显示多少条
                    total: 10, // 总条数
                    pageSizes: [10, 20, 30, 40],
                },
            },
        };
    },
    mounted() {
        this.getList();
    },
    methods: {
        // 根据字典类型获取数据
        // async getDict() {
        //     const params = {
        //         typeList: ["topic_type", "major_type"],
        //     };
        //     await dicApi.getDictDataTypes(params).then((res) => {
        //         if (res.respType === 1) {
        //             this.search.enums.radioList = res.respData.major_type;
        //             this.search.enums.styleList = res.respData.topic_type;
        //         }
        //     });
        // },
        // 按钮的方法
        add() {
            this.title = "add"
            this.dialogVisible = true
        },
        edit(row) {
            this.title = "edit"
            this.row = row;
            this.dialogVisible = true
        },
        // 多选框的返回数据
        selected(value) {
            this.sels = value
        },
        // 删除
        delete(row, fn) {
            this.$confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除题库序号为" + row.id) + "的题库", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(async () => {
                const params = {
                    busiCode: 1001,
                    ids: typeof fn === "function" ? row : [row.id],
                    tranCode: "361304",
                };
                await bankApi.libDelete(params).then((res) => {
                    if (res.respType === 1) {
                        this.$message({
                            type: "success",
                            message: "删除成功!",
                        });
                        if (typeof fn === "function") {
                            fn()
                        }
                        this.getList();
                    }
                });
            });
        },
        // 批量删除
        deleteChoose() {
            if (this.sels.length <= 0) {
                this.$message({
                    type: "warning",
                    message: "请先选择删除的数据",
                });
                return false
            }
            const ids = this.sels.map((item) => item.id)
            this.delete(ids, () => {
                this.sels = []
            })
        },
        // 详情
        detail(row) {
            this.$router.push({
                path: "/exam/topic",
                query: {
                    id: row.id
                }
            })
        },
        // 组件的下一页
        pageChanged(page) {
            this.getList(page);
        },
        // 组件的分页大小
        sizeChanged(size) {
            this.table.page.pageSize = size;
            this.getList();
        },
        // 获取分页数据
        getListPage({ pageNum, total }) {
            this.table.page = {
                page: pageNum,
                size: this.table.page.size,
                total: total,
                pageSizes: this.table.page.pageSizes,
            };
        },
        // 获取列表数据
        async getList(pageNum) {
            if (typeof pageNum !== "number") {
                pageNum = 1;
            }

            const pageData = {
                pageNum: pageNum,
                pageSize: this.table.page.size,
            };
            Object.assign(pageData, {
                busiCode: "1001",
                tranCode: "361303",
                ...this.search.data
            });
            await bankApi.libPage(pageData).then(res => {
                if (res.respType === 1) {
                    this.getListPage({
                        total: res.respData.total,
                        pageNum: res.respData.pageNum,
                    })
                    this.table.data = res.respData.list;
                }
            })
        },
        formatter(key, value, row) {
            if (key === "major") {
                return this.$getFindValue(
                    row[key],
                    this.search.enums.radioList,
                    "dictValue",
                    "dictLabel"
                );
            }
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
