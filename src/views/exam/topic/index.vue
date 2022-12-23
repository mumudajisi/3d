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
            @success="getList"
        >
            <template #correct="{ scope }">
                <div v-if="scope.row.topicType === '1'" v-html="getCorrect(scope.row)" />
                <div v-else-if="scope.row.topicType === '2'" v-html="getMultipleCorrect(scope.row) " />
                <div v-else-if="scope.row.topicType === '3'" v-html="getJudgeCorrect(scope.row)" />
                <div v-else-if="scope.row.topicType === '4'" v-html="getGapFillCorrect(scope.row) " />
                <div v-else-if="scope.row.topicType === '5'" v-html="scope.row.correct" />
            </template>
        </BaseTable>
        <AddOrEdit
            v-if="dialogVisible"
            :title="title"
            :row="row"
            :hide-dialog="() => (dialogVisible = false)"
            :radio="search.enums.radioList"
            @success="getList"
        />
    </div>
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew"
import BaseTable from "@/components/BaseTableNew"
import AddOrEdit from "@/views/exam/topic/components/addOrEdit"
import dicApi from "@/api/dict"
import topicApi from "@/api/topic"
export default {
    name: "TopicIndex",
    components: {
        BaseSearch,
        BaseTable,
        AddOrEdit
    },
    data() {
        return {
            title: "",
            row: null,
            topicList: [],
            sels: [],
            dialogVisible: false,
            resourceTypeList: [],
            search: {
                otherConfig: {
                    // labelWidth: 70
                },
                config: [
                    {
                        type: "text",
                        name: "题目名称",
                        placeholder: "请输入题目名称",
                        bind: "topic",
                    },
                    // {
                    //     type: "select",
                    //     name: "专业",
                    //     bind: "major",
                    //     dataList: "styleList",
                    //     placeholder: "请选择题目类型",
                    //     filterable: "false" // 不需要可输入的时候请填写字符串的false
                    // },
                    {
                        type: "select",
                        name: "题目类型",
                        bind: "topicType",
                        dataList: "radioList",
                        placeholder: "请选择题目类型",
                        filterable: "false" // 不需要可输入的时候请填写字符串的false
                    }
                ],
                data: {
                    major: "", // 专业类别
                    topicType: "", // 题目类型
                    topic: ""
                },
                enums: {
                    radioList: [],
                    styleList: []
                }
            },
            table: {
                data: [],
                config: {
                    header: [
                        // {
                        //     type: "textHtml",
                        //     prop: "major",
                        //     name: "专业"
                        // },
                        {
                            type: "html",
                            prop: "topic",
                            name: "题目名称",
                        },
                        {
                            type: "textHtml",
                            prop: "topicType",
                            name: "题目类型"
                            // hidden: true,
                        },
                        {
                            cellSlot: "correct",
                            prop: "correct",
                            name: "答案"
                        },
                        {
                            type: "text",
                            prop: "createTime",
                            name: "创建时间"
                        }
                    ],
                    outerBtn: [
                        {
                            name: "新增",
                            method: "add",
                            icon: "el-icon-plus",
                            code: "topic/add",
                        },
                        {
                            name: "批量删除",
                            method: "deleteChoose",
                            icon: "el-icon-delete",
                            code: "topic/delete",
                            type: "danger" // primary / success / warning / danger / info / text
                        }
                    ],
                    innerBtn: [
                        {
                            name: "编辑",
                            method: "edit",
                            icon: "el-icon-edit",
                            code: "topic/edit",
                        },
                        {
                            name: "删除",
                            method: "delete",
                            icon: "el-icon-delete",
                            code: "topic/delete",
                        }
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
    computed: {
        // 单选
        getCorrect(row) {
            return function (row) {
                const obj = this.$getFindValue(
                    row.correct,
                    JSON.parse(row.options),
                    "dictValue"
                )
                return obj.dictLabel + "：" + obj.content.replace(/<[^<>]+>/g, "").replace(/&nbsp;/ig, "")
            }
        },
        // 多选
        getMultipleCorrect(row) {
            return function (row) {
                let str = ""
                JSON.parse(row.options)?.forEach(item => {
                    JSON.parse(row.correct)?.forEach(val => {
                        if (item.dictValue === val) {
                            str += item.dictLabel + "：" + item.content.replace(/<[^<>]+>/g, "").replace(/&nbsp;/ig, "") + "，"
                        }
                    })
                })
                return str
            }
        },
        // 判断
        getJudgeCorrect(row) {
            return function (row) {
                const obj = this.$getFindValue(
                    row.correct,
                    JSON.parse(row.options),
                    "dictValue"
                )
                return obj.dictValue + "：" + obj.dictLabel
            }
        },
        // 填空
        getGapFillCorrect(row) {
            return function (row) {
                let str = ""
                JSON.parse(row.correct)?.forEach(item => {
                    str += item.title + "：" + item.content + "，"
                })
                return str
            }
        }
    },
    mounted() {
        this.getDict()
        this.getList()
    },
    methods: {
        // 根据字典类型获取数据
        async getDict() {
            const params = {
                typeList: ["topic_type", "major_type", "bank_code"]
            }
            await dicApi.getDictDataTypes(params).then((res) => {
                if (res.respType === 1) {
                    this.search.enums.radioList = res.respData.topic_type
                    this.search.enums.styleList = res.respData.major_type
                    this.search.enums.bankList = res.respData.bank_code
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
            this.row = row
        },
        // 多选框的返回数据
        selected(value) {
            this.sels = value
        },
        // 删除
        delete(row, fn) {
            this.$confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除试题序号为" + row.id) + "的题目", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(async () => {
                const params = {
                    busiCode: 1001,
                    ids: typeof fn === "function" ? row : [row.id],
                    tranCode: "361504"
                }
                await topicApi.subjectDelete(params).then((res) => {
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
                tranCode: "361503",
                ...this.search.data
            })
            await topicApi.subjectPage(pageData).then(res => {
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
            if (key === "major") {
                return this.$getFindValue(
                    row[key],
                    this.search.enums.styleList,
                    "dictValue",
                    "dictLabel"
                )
            } else if (key === "topicType") {
                return this.$getFindValue(
                    row[key],
                    this.search.enums.radioList,
                    "dictValue",
                    "dictLabel"
                )
            } else if (key === "bankCode") {
                return this.$getFindValue(
                    row[key],
                    this.search.enums.bankList,
                    "dictValue",
                    "dictLabel"
                )
            }
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep p{
    margin: 0;
}

</style>
