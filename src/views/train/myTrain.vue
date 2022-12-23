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
            :other-config="table.otherConfig"
            :table-config="table.config"
            :table-data="table.data"
            :table-page="table.page"
            @pageChanged="pageChanged"
            @sizeChanged="sizeChanged"
        />
    </div>
</template>
<script>
import BaseSearch from "@/components/BaseSearchNew";
import BaseTable from "@/components/BaseTableNew";
import trainApi from "@/api/train"
import moment from "moment/moment";
export default {
    name: "ExampleIndex",
    components: {
        BaseSearch,
        BaseTable,
    },
    data() {
        return {
            search: {
                otherConfig: {
                    labelWidth: 70,
                },
                config: [
                    {
                        type: "text",
                        name: "培训名称",
                        placeholder: "请输入培训名称",
                        itemWidth: "350px",
                        bind: "trainName",
                    },
                ],
                data: {
                    trainName: "", // 培训人员
                },
                enums: {

                },
            },
            table: {
                data: [],
                config: {
                    header: [
                        {
                            type: "text",
                            prop: "trainName",
                            name: "培训名称"
                        },
                        {
                            type: "text",
                            prop: "signupTime",
                            name: "报名时间",
                        },
                    ],
                    outerBtn: [
                    ],
                    innerBtn: [
                        {
                            name: "详情",
                            method: "detail",
                            icon: "el-icon-s-promotion",
                            code: "myTrain/detail",
                        },
                    ],
                },
                otherConfig: {
                    rowKey: "id", // 行数据的 Key
                    selection: false, // 是否展示多选
                    index: "序号", // 是否显示序号
                },
                page: {
                    pageNum: 0, // 当前页,第几页
                    size: 10, // 每页显示多少条
                    total: 10, // 总条数
                    pageSizes: [10, 20, 30, 40],
                },
            },
        };
    },
    mounted() {
        this.getList();
    },
    methods: {
        // 报名的方法
        detail(row) {
            this.$router.push({
                path: "/trainDetail",
                query: { id: row.id }
            })
        },
        // 组件的下一页
        pageChanged(page) {
            this.getList(page);
        },
        // 组件的分页大小
        sizeChanged(size) {
            this.table.page.pageSize = size;
            this.getList();
        },
        // 获取分页数据
        getListPage({ pageNum, total }) {
            this.table.page = {
                page: pageNum,
                size: this.table.page.size,
                total: total,
                pageSizes: this.table.page.pageSizes,
            };
        },
        // 获取列表数据
        async getList(pageNum) {
            if (typeof pageNum !== "number") {
                pageNum = 1;
            }

            const pageData = {
                pageNum: pageNum,
                pageSize: this.table.page.size,
            };
            Object.assign(pageData, {
                busiCode: "1001",
                tranCode: "362303",
                userId: this.$store.getters["userx/user"].userId,
                signupTime: this.search.data.signupTime ? moment(this.search.data.signupTime).format("YYYY-MM-DD HH:mm:ss") : undefined,
                userName: this.search.data.userName, // 报名用户
                trainName: this.search.data.trainName, // 培训人员
            });
            await trainApi.userPage(pageData).then(res => {
                if (res.respType === 1) {
                    this.getListPage({
                        total: res.respData.total,
                        pageNum: res.respData.pageNum,
                    })
                    this.table.data = res.respData.list;
                }
            })
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
