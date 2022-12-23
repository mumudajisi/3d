<template>
    <el-dialog title="选择题目" visible width="870px" append-to-body @close="hideDialog">
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
        <span slot="footer">
            <el-button @click="hideDialog">取 消</el-button>
            <el-button type="primary" @click="submit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew"
import BaseTable from "@/components/BaseTableNew"
import dicApi from "@/api/dict"
import topicApi from "@/api/topic"
export default {
    name: "PaperTopic",
    components: {
        BaseSearch,
        BaseTable,
    },
    props: {
        hideDialog: {
            type: Function,
            default() {
                return () => {};
            },
        },
        // 专业类型
        major: {
            type: String,
            default: ""
        },
        // 题库
        bankCode: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            selects: [],
            search: {
                otherConfig: {
                    labelWidth: 70
                },
                config: [
                    {
                        type: "text",
                        name: "题目名称",
                        placeholder: "请输入题目名称",
                        bind: "topic",
                        itemWidth: "300px"
                    },
                    {
                        type: "select",
                        name: "题目类型",
                        bind: "topicType",
                        dataList: "topicTypeList",
                        placeholder: "请选择题目类型",
                        itemWidth: "300px",
                        filterable: "false" // 不需要可输入的时候请填写字符串的false
                    },
                ],
                data: {
                    topic: "",
                    topicType: "",
                    major: this.major,
                    bankId: this.bankCode
                },
                enums: {
                    topicTypeList: [],
                }
            },
            table: {
                data: [],
                config: {
                    header: [
                        {
                            type: "html",
                            prop: "topic",
                            name: "题目名称"
                        },
                        {
                            type: "text",
                            prop: "createTime",
                            name: "创建时间",
                        }
                    ],
                    outerBtn: false,
                    innerBtn: false
                },
                otherConfig: {
                    rowKey: "id",
                    selection: true,
                    index: "序号"
                },
                page: {
                    total: 0,
                    pageNo: 1,
                    pageSize: 10,
                }
            }
        }
    },
    mounted() {
        this.getDict()
        this.getList()
    },
    methods: {
        selected(value) {
            this.selects = value
        },
        submit() {
            this.selects.map(item => {
                if (item.topicType === "1" || item.topicType === "2" || item.topicType === "3") {
                    item.options = JSON.parse(item.options)
                }
            })
            this.$emit("submit", this.selects)
            this.hideDialog()
        },
        // 根据字典类型获取数据
        getDict() {
            const params = {
                typeList: ["topic_type"],
            };
            dicApi.getDictDataTypes(params).then((res) => {
                if (res.respType === 1) {
                    this.search.enums.topicTypeList = res.respData.topic_type;
                }
            });
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
                tranCode: "361503",
                ...this.search.data
            });
            await topicApi.subjectPage(pageData).then(res => {
                if (res.respType === 1) {
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
