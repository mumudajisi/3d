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
            :formatter="formatter"
            @pageChanged="pageChanged"
            @sizeChanged="sizeChanged"
            @selected="selected"
        />
        <AddPaper
            v-if="dialogVisible"
            :title="title"
            :dict-list="{
                paperTypeList: search.enums.paperTypeList, //  试卷类型
                majorList: search.enums.majorList, // 专业类型
                bankCodeList: search.enums.bankCodeList, // 题库
            }"
            :row-list="rowList"
            :hide-dialog="() => (dialogVisible = false)"
            @success="getList"
        />
    </div>
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew"
import BaseTable from "@/components/BaseTableNew"
import AddPaper from "@/views/exam/paper/components/AddPaper"
import { bank, paper } from "@/api"
import dicApi from "@/api/dict"

export default {
    name: "PaperIndex",
    components: {
        BaseSearch,
        BaseTable,
        AddPaper
    },
    data() {
        return {
            title: "add",
            rowList: null, // 编辑的时候的数据
            selectedList: [], // 多选的数据
            dialogVisible: false,
            search: {
                otherConfig: {
                    labelWidth: 80
                },
                config: [
                    {
                        type: "text",
                        name: "试卷名称",
                        placeholder: "请输入试卷名称",
                        itemWidth: "350px",
                        bind: "paperName",
                    },
                    // {
                    //     type: "select",
                    //     name: "试卷类型",
                    //     bind: "paperType",
                    //     itemWidth: "350px",
                    //     dataList: "paperTypeList",
                    //     placeholder: "请选择试卷类型",
                    //     filterable: "false"
                    // },
                    // {
                    //     type: "select",
                    //     name: "专业类型",
                    //     bind: "major",
                    //     dataList: "majorList",
                    //     itemWidth: "350px",
                    //     placeholder: "请选择专业类型",
                    //     filterable: "false"
                    // },
                    {
                        type: "select",
                        name: "题库",
                        bind: "paperCode",
                        dataList: "bankCodeList",
                        itemWidth: "350px",
                        placeholder: "请选择题库",
                        filterable: "false"
                    }
                ],
                data: {
                    paperName: "",
                    paperType: "",
                    major: "0",
                },
                enums: {
                    paperTypeList: [], //  试卷类型
                    majorList: [], // 专业类型
                    bankCodeList: [], // 题库代码
                }
            },
            table: {
                data: [],
                config: {
                    header: [
                        {
                            type: "text",
                            prop: "paperName",
                            name: "试卷名称"
                        },
                        {
                            type: "text",
                            prop: "score",
                            name: "试卷总分"
                        },
                        {
                            type: "textHtml",
                            prop: "bankCode",
                            name: "题库"
                        },
                    ],
                    outerBtn: [
                        {
                            name: "新增",
                            method: "add",
                            icon: "el-icon-plus",
                            code: "paper/add",
                        },
                        {
                            name: "批量删除",
                            method: "batchDelete",
                            icon: "el-icon-delete",
                            code: "paper/delete",
                            type: "danger"
                        }
                    ],
                    innerBtn: [
                        {
                            name: "编辑",
                            method: "edit",
                            icon: "el-icon-edit",
                            code: "paper/edit",
                        },
                        {
                            name: "删除",
                            method: "delete",
                            icon: "el-icon-delete",
                            code: "paper/delete",
                        },
                        // {
                        //     name: "预览",
                        //     method: "preview",
                        //     icon: "el-icon-delete"
                        //     // code: "menu/add",
                        // }
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
        this.getBankCode()
        this.getList()
    },
    methods: {
        // 字典表数据
        async getDict() {
            const params = {
                typeList: ["exam_type", "major_type"]
            }
            await dicApi.getDictDataTypes(params).then((res) => {
                if (res.respType === 1) {
                    this.search.enums.paperTypeList = res.respData.exam_type // 试卷类型
                    this.search.enums.majorList = res.respData.major_type // 专业类型
                }
            })
        },
        // 获取题库
        getBankCode() {
            const params = {
                busiCode: "1001",
                tranCode: "361305",
            }
            bank.libSelect(params).then(res => {
                if (res.respType === 1) {
                    const arr = []
                    res.respData?.forEach(item => {
                        arr.push({
                            dictLabel: item.bankName,
                            dictValue: item.bankCode
                        })
                    })
                    this.search.enums.bankCodeList = arr
                }
            })
        },
        // 按钮的方法
        add() {
            this.title = "add"
            this.dialogVisible = true
        },
        edit(row) {
            this.title = "edit"
            this.dialogVisible = true
            this.rowList = row
        },
        // 批量删除
        batchDelete() {
            if (this.selectedList.length <= 0) {
                this.$message({
                    type: "warning",
                    message: "请先选择删除的数据",
                });
                return false
            }
            const ids = this.selectedList.map((item) => item.id)
            this.delete(ids, () => {
                this.selectedList = []
            })
        },
        // 删除
        delete(row, fn) {
            this.$confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除试卷序号为" + row.id) + "的试卷", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                const params = {
                    busiCode: 1001,
                    ids: typeof fn === "function" ? row : [row.id],
                    tranCode: "361404"
                }
                paper.examPaperDelete(params).then((res) => {
                    if (res.respType === 1) {
                        this.$message({
                            type: "success",
                            message: "删除成功!"
                        })
                        if (typeof fn === "function") {
                            fn()
                        }
                        this.getList()
                    }
                })
            })
        },
        // 预览
        // preview() {
        //     console.log("我是预览")
        // },
        // 多选框的返回数据
        selected(arr) {
            this.selectedList = arr
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
        // 获取分页数据
        getListPage({ pageNum, total }) {
            this.table.page = {
                page: pageNum,
                size: this.table.page.size,
                total: total,
                pageSizes: this.table.page.pageSizes,
            }
        },
        // 获取列表数据
        getList(pageNum) {
            if (typeof pageNum !== "number") {
                pageNum = 1
            }
            const params = {
                pageNum: pageNum,
                pageSize: this.table.page.size,
                busiCode: "1001",
                tranCode: "361403",
                ...this.search.data
            }
            paper.examPaperPage(params).then(res => {
                if (res.respType === 1) {
                    this.getListPage({
                        total: res.respData.total,
                        pageNum: res.respData.pageNum
                    })
                    this.table.data = res.respData.list
                }
            })
        },
        formatter(key, value, row) {
            if (key === "paperType") {
                return this.$getFindValue(
                    String(row[key]),
                    this.search.enums.paperTypeList,
                    "dictValue",
                    "dictLabel"
                )
            } else if (key === "major") {
                return this.$getFindValue(
                    row[key],
                    this.search.enums.majorList,
                    "dictValue",
                    "dictLabel"
                )
            } else if (key === "bankCode") {
                return this.$getFindValue(
                    row[key],
                    this.search.enums.bankCodeList,
                    "dictValue",
                    "dictLabel"
                )
            }
        }
    }
}
</script>

<style lang="scss" scoped></style>
