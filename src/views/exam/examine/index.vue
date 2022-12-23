<template>
    <div class="app-container">
        <BaseSearch
            v-model="search.data"
            :config="search.config"
            :enums="search.enums"
            :other-config="search.otherConfig"
            @queryList="getList"
        />
        <BaseTable
            :table-data="table.data"
            :table-config="table.config"
            :table-page="table.page"
            :other-config="table.otherConfig"
            @pageChanged="pageChanged"
            @sizeChanged="sizeChanged"
            @selected="selected"
            @success="getList"
        />
    </div>
</template>
<script>
import BaseSearch from "@/components/BaseSearchNew"
import BaseTable from "@/components/BaseTableNew"
import studentApi from "@/api/stundet"
export default {
    name: "ExamineIndex",
    components: {
        BaseSearch,
        BaseTable,
    },
    data() {
        return {
            title: "",
            row: null,
            sels: [], // 多选框数据
            dialogVisible: false,
            search: {
                otherConfig: {
                    labelWidth: 80
                },
                config: [
                    {
                        type: "text",
                        name: "考生姓名",
                        placeholder: "请输入考生名",
                        bind: "userName",
                        itemWidth: "360px"
                    },
                    {
                        type: "text",
                        name: "分数",
                        bind: "score",
                        placeholder: "请输入分数",
                        itemWidth: "360px",
                        filterable: "false"
                    },
                ],
                data: {
                    userName: "",
                    score: "",
                },
                enums: {
                }
            },
            table: {
                data: [],
                config: {
                    header: [
                        {
                            type: "text",
                            prop: "userName",
                            name: "考生名"
                        },
                        {
                            type: "text",
                            prop: "score",
                            name: "分数"
                        },
                        {
                            type: "text",
                            prop: "createTime",
                            name: "创建时间"
                        }
                    ],
                    outerBtn: [
                        {
                            name: "批量删除",
                            method: "deleteChoose",
                            icon: "el-icon-delete",
                            code: "examine/delete",
                            type: "danger",
                        },
                    ],
                    innerBtn: [
                        {
                            name: "删除",
                            method: "delete",
                            icon: "el-icon-delete",
                            code: "examine/delete",
                        },
                        {
                            name: "批改试卷",
                            method: "result",
                            icon: "el-icon-edit",
                            validate: this.innerBtnShow,
                            code: "examine/result",
                        },
                    ]
                },
                otherConfig: {
                    rowKey: "id", // 行数据的 Key
                    selection: true, // 是否展示多选
                    index: "序号" // 是否显示序号
                },
                page: {
                    pageNum: 0, // 当前页,第几页
                    size: 10, // 每页显示多少条
                    total: 10, // 总条数
                    pageSizes: [10, 20, 30, 40],
                },
            }
        }
    },
    watch: {
        "$route": {
            handler() {
                if (this.$route.path !== "/exam/examine") return false
                this.getList()
            },
            immediate: true,
        },
    },
    // mounted() {
    //     this.getList()
    // },
    methods: {
        innerBtnShow(item, row) {
            if (item.method === "result") {
                return row.score >= 0 && row.submitTime
            }
        },
        // 组件的下一页
        pageChanged(page) {
            this.getList(page)
        },
        // 组件的分页大小
        sizeChanged(size) {
            this.table.page.size = size
            this.getList()
        },
        // 删除
        delete(row, fn) {
            this.$confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除考生序号为" + row.id) + "的考生", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(async () => {
                const params = {
                    busiCode: 1001,
                    ids: [row.id],
                    tranCode: "361804",
                };
                await studentApi.userDelete(params).then((res) => {
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
        // 多选框的返回数据
        selected(value) {
            this.sels = value
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
        // 获取分页数据
        getListPage({ pageNum, total }) {
            this.table.page = {
                page: pageNum,
                size: this.table.page.size,
                total: total,
                pageSizes: this.table.page.pageSizes
            }
        },
        // 查看答案 + 批改
        result(row) {
            const name = row.userId
            const exams = row.examId
            this.$router.push({
                path: "correcting",
                query: { name, exams }
            })
        },
        // 获取考生详情
        async getList(pageNum) {
            if (typeof pageNum !== "number") {
                pageNum = 1;
            }
            const pageData = {
                pageNum: pageNum,
                pageSize: this.table.page.pageSize,
            };
            Object.assign(pageData, {
                busiCode: "1001",
                tranCode: "361803",
                examId: Number(this.$route.query.exams),
                ...this.search.data
            });
            await studentApi.userPage(pageData).then(res => {
                if (res.respType === 1) {
                    res.respData.list.forEach(item => {
                        if (item.score !== undefined) {
                            item.score = String(item.score)
                        }
                    })
                    this.getListPage({
                        total: res.respData.total,
                        pageNum: res.respData.pageNum,
                    })
                    this.table.data = res.respData.list;
                }
            })
        },
    }
}
</script>

<style lang="scss" scoped></style>
