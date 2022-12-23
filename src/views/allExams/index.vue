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
        >
            <template #status="{ scope }">
                <el-tag :type="scope.row.status===1?'success':scope.row.status===2?'warning':scope.row.status===0?'':''">{{ scope.row.status === 0? "未开始":scope.row.status=== 1?"进行中":scope.row.status===2?"已结束":"" }}
                </el-tag></template>
        </BaseTable>
    </div>
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew"
import BaseTable from "@/components/BaseTableNew"
// import dicApi from "@/api/dict"
import mgrApi from "@/api/exam"
import studentApi from "@/api/stundet"
export default {
    name: "ExamIndex",
    components: {
        BaseSearch,
        BaseTable,
    },
    data() {
        return {
            title: "add",
            row: null,
            dialogVisible: false,
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
                    examModeList: [
                        {
                            dictValue: "1",
                            dictLabel: "普通",
                        },
                        {
                            dictValue: "2",
                            dictLabel: "培训",
                        },
                    ], // 考试模式
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
                            width: 300
                        },
                        {
                            cellSlot: "status",
                            prop: "status",
                            name: "培训状态",
                            width: 100
                        },
                        {
                            type: "textHtml",
                            prop: "examMode",
                            name: "考试类型"
                        },
                        {
                            type: "text",
                            prop: "examTimes",
                            name: "考试时长"
                        },
                        {
                            type: "text",
                            prop: "examTime",
                            name: "开始时间"
                        },
                        {
                            type: "text",
                            prop: "deadline",
                            name: "结束时间"
                        },
                        {
                            type: "text",
                            prop: "createTime",
                            name: "创建时间",
                        }
                    ],
                    outerBtn: false,
                    innerBtn: [
                        {
                            name: "报名",
                            method: "sign",
                            icon: "el-icon-thumb",
                            code: "allExams/sign",
                            bind: "sign",
                            // validate: this.innerBtnShow,
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
        this.getList()
    },
    methods: {
        // 按钮显示隐藏
        // innerBtnShow(item, row) {
        //     if (item.bind === "sign") {
        //         // return row.canSignUp
        //     } else {
        //         return true
        //     }
        // },
        // 报名
        async sign(row) {
            const nowDate = new Date().getTime()
            const startDate = new Date(row.examTime).getTime()
            if (nowDate >= startDate) {
                this.$message.warning("报名时间已过")
                return false
            }
            const params = {
                busiCode: "1001",
                tranCode: 361801,
                examId: row.id,
                examName: row.examName,
                userName: this.$store.getters["userx/user"].userName,
                userId: this.$store.getters["userx/user"].userId
            };
            await studentApi.userAdd(params).then(res => {
                if (res.respType === 1) {
                    this.$message({
                        type: "success",
                        message: "报名成功"
                    })
                    this.getList(this.table.page.page)
                }
            })
        },
        // // 字典表数据
        // getDict() {
        //     const params = {
        //         typeList: ["exam_mode"]
        //     }
        //     dicApi.getDictDataTypes(params).then((res) => {
        //         if (res.respType === 1) {
        //             this.search.enums.examModeList = res.respData.exam_mode // 考试模式
        //         }
        //     })
        // },
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
