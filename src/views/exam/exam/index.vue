<template>
    <div v-if="$route.path === '/exam/exam'" class="app-container">
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
            :formatter="formatter"
            @pageChanged="pageChanged"
            @sizeChanged="sizeChanged"
            @selected="selected"
        />
        <addOrEdit
            v-if="dialogVisible"
            :title="title"
            :row="row"
            :dict-list="{
                examModeList: search.enums.examModeList, // 考试模式
            }"
            :hide-dialog="() => (dialogVisible = false)"
            @success="getList"
        />
    </div>
    <router-view v-else />
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew"
import BaseTable from "@/components/BaseTableNew"
import addOrEdit from "@/views/exam/exam/components/addOrEdit"
import dicApi from "@/api/dict"
import mgrApi from "@/api/exam"
export default {
    name: "ExamIndex",
    components: {
        BaseSearch,
        BaseTable,
        addOrEdit
    },
    data() {
        return {
            title: "add",
            row: null,
            selectList: [],
            dialogVisible: false,
            search: {
                otherConfig: {
                    labelWidth: 80
                },
                config: [
                    {
                        type: "text",
                        name: "考试名称",
                        placeholder: "请输入考试名称",
                        bind: "examName",
                        itemWidth: "360px"
                    },
                    // {
                    //     type: "select",
                    //     name: "考试模式",
                    //     bind: "examMode",
                    //     dataList: "examModeList",
                    //     placeholder: "请选择考试模式",
                    //     itemWidth: "360px",
                    //     filterable: "false"
                    // },
                ],
                data: {
                    examName: "",
                    examMode: "",

                },
                enums: {
                    examModeList: [], // 考试模式
                }
            },
            table: {
                data: [],
                config: {
                    header: [
                        {
                            type: "text",
                            prop: "examName",
                            name: "考试名称",
                        },
                        // {
                        //     type: "textHtml",
                        //     prop: "examMode",
                        //     width: 150,
                        //     name: "考试模式"
                        // },
                        {
                            type: "text",
                            prop: "examTimes",
                            name: "考试时长",
                        },
                        {
                            type: "text",
                            prop: "examTime",
                            name: "考试开始时间"
                        },
                        {
                            type: "text",
                            prop: "deadline",
                            width: 180,
                            name: "考试结束时间"
                        },
                        {
                            type: "text",
                            prop: "createTime",
                            width: 180,
                            name: "创建时间",
                        }
                    ],
                    outerBtn: [
                        {
                            name: "新增",
                            method: "add",
                            icon: "el-icon-plus",
                            code: "exam/add",
                        },
                        {
                            name: "批量删除",
                            method: "deleteChoose",
                            icon: "el-icon-delete",
                            code: "exam/delete",
                            type: "danger"
                        }
                    ],
                    innerBtn: [
                        {
                            name: "编辑",
                            method: "edit",
                            icon: "el-icon-edit",
                            code: "exam/edit",
                        },
                        {
                            name: "删除",
                            method: "delete",
                            icon: "el-icon-delete",
                            code: "exam/delete",
                        },
                        {
                            name: "考生",
                            method: "examine",
                            icon: "el-icon-user",
                            code: "exam/student",
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
    mounted() {
        this.getDict()
        this.getList()
    },
    methods: {
        // 字典表数据
        getDict() {
            const params = {
                typeList: ["exam_mode"]
            }
            dicApi.getDictDataTypes(params).then((res) => {
                if (res.respType === 1) {
                    this.search.enums.examModeList = res.respData.exam_mode // 考试模式
                }
            })
        },
        // 按钮的方法
        add() {
            this.title = "add"
            this.dialogVisible = true
        },
        // 编辑
        edit(row) {
            this.title = "edit"
            this.dialogVisible = true
            this.row = row
        },
        // 删除
        delete(row, fn) {
            this.$confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除考试序号为" + row.id) + "的考试", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(async () => {
                const params = {
                    busiCode: 1001,
                    ids: typeof fn === "function" ? row : [row.id],
                    tranCode: "361604",
                };
                await mgrApi.mrgDelete(params).then((res) => {
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
            this.selectList = value
        },
        // 批量删除
        deleteChoose() {
            if (this.selectList.length <= 0) {
                this.$message({
                    type: "warning",
                    message: "请先选择删除的数据",
                });
                return false
            }
            const ids = this.selectList.map((item) => item.id)
            this.delete(ids, () => {
                this.selectList = []
            })
        },
        // 考生
        examine(row) {
            const exams = row.id
            this.$router.push({
                path: "/exam/examine",
                query: {
                    exams
                }
            })
        },
        // 组件下一页
        pageChanged(page) {
            this.getList(page)
        },
        // 组件的分页大小
        sizeChanged(size) {
            this.table.page.size = size
            this.getList()
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
        // 获取列表数据
        async getList(pageNum) {
            if (typeof pageNum !== "number") {
                pageNum = 1
            }
            const pageData = {
                pageNum: pageNum,
                pageSize: this.table.page.size
            }
            Object.assign(pageData, {
                busiCode: "1001",
                tranCode: "361603",
                ...this.search.data
            });
            await mgrApi.mrgPage(pageData).then(res => {
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
            if (key === "examMode") {
                return this.$getFindValue(
                    String(row[key]),
                    this.search.enums.examModeList,
                    "dictValue",
                    "dictLabel"
                );
            }
        },
    }
}
</script>

<style lang="scss" scoped></style>
