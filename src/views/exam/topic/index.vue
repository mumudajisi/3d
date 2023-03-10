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
                        name: "????????????",
                        placeholder: "?????????????????????",
                        bind: "topic",
                    },
                    // {
                    //     type: "select",
                    //     name: "??????",
                    //     bind: "major",
                    //     dataList: "styleList",
                    //     placeholder: "?????????????????????",
                    //     filterable: "false" // ????????????????????????????????????????????????false
                    // },
                    {
                        type: "select",
                        name: "????????????",
                        bind: "topicType",
                        dataList: "radioList",
                        placeholder: "?????????????????????",
                        filterable: "false" // ????????????????????????????????????????????????false
                    }
                ],
                data: {
                    major: "", // ????????????
                    topicType: "", // ????????????
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
                        //     name: "??????"
                        // },
                        {
                            type: "html",
                            prop: "topic",
                            name: "????????????",
                        },
                        {
                            type: "textHtml",
                            prop: "topicType",
                            name: "????????????"
                            // hidden: true,
                        },
                        {
                            cellSlot: "correct",
                            prop: "correct",
                            name: "??????"
                        },
                        {
                            type: "text",
                            prop: "createTime",
                            name: "????????????"
                        }
                    ],
                    outerBtn: [
                        {
                            name: "??????",
                            method: "add",
                            icon: "el-icon-plus",
                            code: "topic/add",
                        },
                        {
                            name: "????????????",
                            method: "deleteChoose",
                            icon: "el-icon-delete",
                            code: "topic/delete",
                            type: "danger" // primary / success / warning / danger / info / text
                        }
                    ],
                    innerBtn: [
                        {
                            name: "??????",
                            method: "edit",
                            icon: "el-icon-edit",
                            code: "topic/edit",
                        },
                        {
                            name: "??????",
                            method: "delete",
                            icon: "el-icon-delete",
                            code: "topic/delete",
                        }
                    ]
                },
                otherConfig: {
                    rowKey: "id", // ???????????? Key
                    selection: true, // ??????????????????
                    index: "??????" // ??????????????????
                },
                page: {
                    pageNum: 0, // ?????????,?????????
                    size: 10, // ?????????????????????
                    total: 10, // ?????????
                    pageSizes: [10, 20, 30, 40],
                },
            }
        }
    },
    computed: {
        // ??????
        getCorrect(row) {
            return function (row) {
                const obj = this.$getFindValue(
                    row.correct,
                    JSON.parse(row.options),
                    "dictValue"
                )
                return obj.dictLabel + "???" + obj.content.replace(/<[^<>]+>/g, "").replace(/&nbsp;/ig, "")
            }
        },
        // ??????
        getMultipleCorrect(row) {
            return function (row) {
                let str = ""
                JSON.parse(row.options)?.forEach(item => {
                    JSON.parse(row.correct)?.forEach(val => {
                        if (item.dictValue === val) {
                            str += item.dictLabel + "???" + item.content.replace(/<[^<>]+>/g, "").replace(/&nbsp;/ig, "") + "???"
                        }
                    })
                })
                return str
            }
        },
        // ??????
        getJudgeCorrect(row) {
            return function (row) {
                const obj = this.$getFindValue(
                    row.correct,
                    JSON.parse(row.options),
                    "dictValue"
                )
                return obj.dictValue + "???" + obj.dictLabel
            }
        },
        // ??????
        getGapFillCorrect(row) {
            return function (row) {
                let str = ""
                JSON.parse(row.correct)?.forEach(item => {
                    str += item.title + "???" + item.content + "???"
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
        // ??????????????????????????????
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
        // ???????????????
        add() {
            this.title = "add"
            this.dialogVisible = true
        },
        edit(row) {
            this.title = "edit"
            this.dialogVisible = true
            this.row = row
        },
        // ????????????????????????
        selected(value) {
            this.sels = value
        },
        // ??????
        delete(row, fn) {
            this.$confirm((typeof fn === "function" ? "????????????????????????" : "???????????????????????????" + row.id) + "?????????", "??????", {
                confirmButtonText: "??????",
                cancelButtonText: "??????",
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
                            message: "????????????!"
                        })
                        if (typeof fn === "function") {
                            fn()
                        }
                        this.getList()
                    }
                })
            })
        },
        // ????????????
        deleteChoose() {
            if (this.sels.length <= 0) {
                this.$message({
                    type: "warning",
                    message: "???????????????????????????",
                });
                return false
            }
            const ids = this.sels.map((item) => item.id)
            this.delete(ids, () => {
                this.sels = []
            })
        },
        // ??????????????????
        pageChanged(page) {
            this.getList(page)
        },
        // ?????????????????????
        sizeChanged(size) {
            this.table.page.size = size
            this.getList()
        },
        // ??????????????????
        getListPage({ pageNum, total }) {
            this.table.page = {
                page: pageNum,
                size: this.table.page.size,
                total: total,
                pageSizes: this.table.page.pageSizes,
            }
        },
        // ??????????????????
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
