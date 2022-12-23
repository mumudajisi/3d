<template>
    <div class="app-container">
        <div class="btn">
            <el-button type="primary">总分:{{ totalScore }}分</el-button>
        </div>
        <div class="table">
            <BaseTable
                :table-data="table.data"
                :table-config="table.config"
                :table-page="table.page"
                :formatter="formatter"
                :other-config="table.otherConfig"
                @pageChanged="pageChanged"
                @sizeChanged="sizeChanged"
                @success="getList"
            />
        </div>
    </div>
</template>

<script>
import BaseTable from "@/components/BaseTableNew"
import scoreApi from "@/api/score"
export default {
    name: "TopicIndex",
    components: {
        BaseTable,
    },
    data() {
        return {
            arrList: null,
            totalScore: 0,
            search: {
                otherConfig: {
                    // labelWidth: 70
                },
                config: [
                ],
                // data: {
                //     major: "", // 专业类别
                //     topicType: "", // 题目类型
                //     topic: ""
                // },

            },
            table: {
                data: [],
                config: {
                    header: [
                        {
                            type: "text",
                            prop: "remark",
                            name: "资源名称",
                        },
                        {
                            type: "text",
                            prop: "postScript",
                            name: "类型",
                        },
                        {
                            type: "textHtml",
                            prop: "scoreMode",
                            name: "获取方式",
                        },
                        {
                            type: "text",
                            prop: "score",
                            name: "得分",
                        },
                        {
                            type: "text",
                            prop: "createTime",
                            name: "获得时间",
                        }
                    ],
                    outerBtn: true,
                    innerBtn: false
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
        this.getScore()
        this.getList()
    },
    methods: {
        // 组件下一页
        pageChanged(page) {
            this.getList(page)
        },
        // 组件的分页大小
        sizeChanged(size) {
            this.table.page.size = size
            this.getList()
        },
        // 总积分
        async getScore() {
            const params = {
                busiCode: "1001",
                bizCode: "1002",
                scoreType: 1,
                tranCode: 361906,
            }
            await scoreApi.integralUserScore(params).then(res => {
                if (res.respType === 1) {
                    this.totalScore = res.respData
                }
            })
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
                pageSize: this.table.page.size,
            }
            Object.assign(pageData, {
                busiCode: "1001",
                userId: this.$store.getters["userx/user"].userId,
                bizCode: "1002",
                tranCode: "361903",
                scoreType: 1,
            })
            await scoreApi.integralQuery(pageData).then(res => {
                if (res.respType === 1) {
                    const arr = []
                    this.getListPage({
                        total: res.respData.total,
                        pageNum: res.respData.pageNum,
                    })
                    this.table.data = res.respData.list
                    this.table.data.forEach(item => {
                        arr.push({
                            dictValue: item.scoreMode,
                            dictLabel: "学习"
                        })
                        this.arrList = arr;
                    })
                }
            })
        },
        formatter(key, value, row) {
            if (key === "scoreMode") {
                return this.$getFindValue(
                    row[key],
                    this.arrList,
                    "dictValue",
                    "dictLabel"
                );
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.btn{
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}
</style>
