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
            @success="getList"
        >
            <template #status="{ scope }">
                <el-tag :type="scope.row.status===1?'success':scope.row.status===2?'warning':scope.row.status===0?'':''">{{ scope.row.status === 0? "未开始":scope.row.status=== 1?"进行中":scope.row.status===2?"已结束":"" }}
                </el-tag></template>
        </BaseTable>
    </div>
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew";
import BaseTable from "@/components/BaseTableNew";
import trainApi from "@/api/train"
import moment from "moment";
import dicApi from "@/api/dict";
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
                        name: "培训标题",
                        placeholder: "请输入培训名称",
                        itemWidth: "350px",
                        bind: "trainName",
                    },
                    {
                        type: "datePicker",
                        name: "开始时间",
                        placeholder: "请选择开始时间",
                        itemWidth: "350px",
                        bind: "beginTime",
                        dateType: "datetime",
                        startPlaceholder: "请选择开始日期", // 范围选择时开始日期的占位内容
                    },
                    {
                        type: "datePicker",
                        name: "结束时间",
                        placeholder: "请选择结束时间",
                        itemWidth: "350px",
                        bind: "closeTime",
                        dateType: "datetime",
                        endPlaceholder: "请选择结束日期", // 范围选择时结束日期的占位内容
                    },
                    {
                        type: "select",
                        name: "培训状态",
                        placeholder: "请选择培训状态",
                        itemWidth: "350px",
                        bind: "status",
                        dataList: "trainStatusList",
                    }
                ],
                data: {
                    beignTime: "", // 开始时间
                    closeTime: "", // 结束时间
                    trainName: "", // 培训标题
                    status: "", // 培训状态

                },
                enums: {
                    trainStatusList: [] // 培训状态
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
                            cellSlot: "status",
                            prop: "status",
                            name: "培训状态",
                            width: 100
                        },
                        {
                            type: "text",
                            prop: "trainAddr",
                            name: "培训地点",
                            width: 200
                        },
                        {
                            type: "text",
                            prop: "beginTime",
                            name: "开始时间",
                            width: 200
                        },
                        {
                            type: "text",
                            prop: "closeTime",
                            name: "结束时间",
                            width: 200
                        },
                    ],
                    outerBtn: [
                    ],
                    innerBtn: [
                        {
                            name: "报名",
                            method: "sign",
                            icon: "el-icon-thumb",
                            code: "allTrain/sign",
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
        this.getDict();
    },
    methods: {
        // 根据字典类型获取数据
        async getDict() {
            const params = {
                typeList: ["train_status"],
            };
            await dicApi.getDictDataTypes(params).then((res) => {
                if (res.respType === 1) {
                    this.search.enums.trainStatusList = res.respData.train_status;
                }
            });
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
        // 报名
        async sign(row) {
            if (row.status === 1 || row.status === 2) {
                this.$message({
                    type: "error",
                    message: row.status === 1 ? "培训已开始，不允许报名" : "培训已结束，不允许报名"
                })
                return false
            }
            const dates = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            if (dates < row.beginTime) {
                const params = {
                    busiCode: "1001",
                    tranCode: "362301",
                    trainCode: row.trainCode,
                    userName: this.$store.getters["userx/user"].userName,
                    userId: this.$store.getters["userx/user"].userId
                }
                await trainApi.userAdd(params).then(res => {
                    if (res.respData === 1) {
                        this.$message({
                            type: "success",
                            message: "报名成功"
                        })
                    }
                })
            } else {
                this.$message({
                    type: "warning",
                    message: "报名时间已过"
                })
            }
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
                tranCode: "362103",
                ...this.search.data,
                beginTime: this.search.data.beginTime ? moment(this.search.data.beginTime).format("YYYY-MM-DD HH:mm:ss") : undefined,
                closeTime: this.search.data.closeTime ? moment(this.search.data.closeTime).format("YYYY-MM-DD HH:mm:ss") : undefined,
            });
            await trainApi.infoPage(pageData).then(res => {
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
            if (key === "status") {
                return this.$getFindValue(
                    String(row[key]),
                    this.search.enums.trainStatusList,
                    "dictValue",
                    "dictLabel"
                );
            }
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
