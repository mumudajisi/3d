<template>
    <div v-if="$route.path === '/student/examList'" class="app-container">
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
        />
    </div>
    <router-view v-else />
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew"
import BaseTable from "@/components/BaseTableNew"
import stundetApi from "@/api/stundet"
// import dicApi from "@/api/dict";
export default {
    name: "ExamListIndex",
    components: {
        BaseSearch,
        BaseTable,
    },
    data() {
        return {
            title: "",
            row: null,
            topicList: [],
            dialogVisible: false,
            resourceTypeList: [],
            search: {
                otherConfig: {
                    // labelWidth: 80
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
                        {
                            type: "text",
                            prop: "score",
                            name: "分数",
                            width: 100
                        },
                        {
                            type: "text",
                            prop: "examTimes",
                            name: "考试时长",
                            width: 150
                        },
                        {
                            type: "text",
                            prop: "examTime",
                            width: 180,
                            name: "考试开始时间"
                        },
                        {
                            type: "text",
                            prop: "deadline",
                            width: 180,
                            name: "考试结束时间"
                        },
                    ],
                    outerBtn: false,
                    innerBtn: [
                        {
                            name: "开始考试",
                            method: "exam",
                            icon: "el-icon-s-platform",
                            validate: this.innerBtnShow,
                            bind: "exam",
                            code: "examList/appendExam",
                        },
                        {
                            name: "查看答案",
                            method: "answer",
                            icon: "el-icon-s-claim",
                            validate: this.innerBtnShow,
                            bind: "answer",
                            code: "examList/answer",
                        },
                    ]
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
            }
        }
    },
    mounted() {
        this.$bus.$on("refreshExamList", () => {
            this.getList()
        })
        this.getList()
    },
    beforeDestroy() {
        this.$bus.$off("refreshExamList")
    },
    methods: {
        // // 字典表数据
        // getDict() {
        //     const params = {
        //         typeList: ["exam_mode"]
        //     }
        //     dicApi.getDictDataTypes(params).then((res) => {
        //         if (res.respType === 1) {
        //             console.log(res)
        //             this.search.enums.examModeList = res.respData.exam_mode // 考试模式
        //         }
        //     })
        // },
        // 开始考试
        exam(row) {
            const nowDate = new Date().getTime()
            const startDate = new Date(row.examTime).getTime()
            const endDate = new Date(row.deadline).getTime()
            if (nowDate >= startDate && nowDate <= endDate) {
                this.$router.push({
                    path: "/student/examList/appendExam",
                    query: {
                        id: row.id,
                        examName: row.examName
                    }
                })
                const startAppendExam = this.$eventBus.on("startAppendExam", () => {
                    this.getList()
                    startAppendExam.off()
                })
            } else {
                this.$message.warning("不在考试时间内")
            }
        },
        // 查看答案
        answer(row) {
            const exams = row.id
            this.$router.push({
                path: "/student/examList/result",
                query: {
                    exams,
                }
            })
        },
        innerBtnShow(item, row) {
            if (item.bind === "exam") {
                return row.examStatus === "0"
            } else if (item.bind === "answer") {
                return row.examStatus === "1"
            }
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
        getList(pageNum) {
            if (typeof pageNum !== "number") {
                pageNum = 1
            }
            const params = {
                pageNum: pageNum,
                pageSize: this.table.page.size,
                busiCode: "1001",
                tranCode: "361806",
                userId: this.$store.getters["userx/user"].userId,
                ...this.search.data
            }
            stundetApi.myExam(params).then(res => {
                if (res.respType === 1) {
                    res.respData.list.forEach(item => {
                        if (item.score !== undefined) {
                            item.score = String(item.score)
                        }
                    })
                    this.getListPage({
                        total: res.respData.total,
                        pageNum: res.respData.pageNum
                    })
                    this.table.data = res.respData.list
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
        }
    }
}
</script>

<style lang="scss" scoped></style>
