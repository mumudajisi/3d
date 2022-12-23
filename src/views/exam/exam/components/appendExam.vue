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
        />
    </div>
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew"
import BaseTable from "@/components/BaseTableNew"
export default {
    name: "AppendExamIndex",
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
                    // labelWidth: 70
                },
                config: [
                    {
                        type: "text",
                        name: "试卷名称",
                        placeholder: "请输入试卷名称",
                        bind: "paperName",
                    },
                    {
                        type: "select",
                        name: "专业",
                        bind: "major",
                        dataList: "styleList",
                        placeholder: "请选择题目类型",
                        filterable: "false" // 不需要可输入的时候请填写字符串的false
                    },
                    {
                        type: "select",
                        name: "试卷类型",
                        bind: "paperType",
                        dataList: "radioList",
                        placeholder: "请选择试卷类型",
                        filterable: "false" // 不需要可输入的时候请填写字符串的false
                    }
                ],
                data: {
                    major: "", // 专业类别
                    paperName: "", // 试卷名称
                    paperType: "", // 试卷类型
                    score: "", // 试卷总分
                    examTimes: "" // 考试时长
                },
                enums: {
                    radioList: [],
                    styleList: []
                }
            },
            table: {
                data: [{
                    major: "1", // 专业类别
                    paperName: "2", // 试卷名称
                    paperType: "3", // 试卷类型
                    score: "44", // 试卷总分
                    examTimes: "444" // 考试时长
                }],
                config: {
                    header: [
                        {
                            type: "textHtml",
                            prop: "major",
                            name: "专业"
                        },
                        {
                            type: "html",
                            prop: "paperName",
                            name: "试卷名称"
                        },
                        {
                            type: "textHtml",
                            prop: "paperType",
                            name: "试卷类型"
                            // hidden: true,
                        },
                        {
                            type: "text",
                            prop: "examTimes",
                            name: "考试时长"
                        },
                        {
                            type: "text",
                            prop: "score",
                            name: "试卷总分"
                        },
                        {
                            type: "text",
                            prop: "createTime",
                            name: "创建时间"
                        }
                    ],
                    outerBtn: [
                    ],
                    innerBtn: [
                        {
                            name: "考试",
                            method: "exam",
                            icon: "el-icon-s-platform"
                            // code: "menu/add",
                        },
                    ]
                },
                otherConfig: {
                    rowKey: "id", // 行数据的 Key
                    selection: true, // 是否展示多选
                    index: "序号" // 是否显示序号
                },
                page: {
                    total: 0,
                    pageNo: 1,
                    pageSize: 10
                }
            }
        }
    },
    computed: {

    },
    mounted() {

    },
    methods: {
        // 考试
        exam(row) {
            this.$router.push({
                path: "/exam/test"
            })
        },
        // 多选框的返回数据
        selected(value) {
            this.sels = value
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
        formatter(key, value, row) {
        }
    }
}
</script>

<style lang="scss" scoped>

</style>
