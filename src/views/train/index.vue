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
            :formatter="formatter"
            :other-config="table.otherConfig"
            :table-config="table.config"
            :table-data="table.data"
            :table-page="table.page"
            @pageChanged="pageChanged"
            @selected="selected"
            @sizeChanged="sizeChanged"
        >
            <template #status="{ scope }">
                <el-tag :type="scope.row.status===1?'success':scope.row.status===2?'warning':scope.row.status===0?'':''">
                    {{ scope.row.status === 0? "未开始":scope.row.status=== 1?"进行中":scope.row.status===2?"已结束":"" }}
                </el-tag>
            </template>
        </BaseTable>
        <AddTrain
            v-if="dialogVisible"
            :row="row"
            :hide-dialog="
                () => (dialogVisible = false)"
            :title="title"
            @success="getList"
        />
    </div>
</template>

<script>
import BaseSearch from "@/components/BaseSearchNew";
import BaseTable from "@/components/BaseTableNew";
import AddTrain from "./components/addTrain"
import trainApi from "@/api/train"
import dicApi from "@/api/dict";
import moment from "moment";
export default {
    name: "ExampleIndex",
    components: {
        BaseSearch,
        BaseTable,
        AddTrain
    },
    data() {
        return {
            title: "add",
            row: null,
            sels: [],
            dialogVisible: false,
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
                        type: "select",
                        name: "培训状态",
                        placeholder: "请选择培训状态",
                        itemWidth: "350px",
                        bind: "status",
                        dataList: "trainStatusList",
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
                    }
                ],
                data: {
                    beginTime: "", // 开始时间
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
                        {
                            name: "新增",
                            method: "add",
                            icon: "el-icon-plus",
                            code: "train/add",
                        },
                        {
                            name: "批量删除",
                            method: "deleteChoose",
                            icon: "el-icon-delete",
                            code: "train/delete",
                            type: "danger",
                        },
                    ],
                    innerBtn: [
                        {
                            name: "详情",
                            method: "detail",
                            icon: "el-icon-s-promotion",
                            code: "train/detail",
                        },
                        {
                            name: "编辑",
                            method: "edit",
                            icon: "el-icon-edit",
                            code: "train/edit",
                        },
                        {
                            name: "删除",
                            method: "delete",
                            icon: "el-icon-delete",
                            code: "train/delete",
                        },
                    ],
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
            },
        };
    },
    mounted() {
        this.getList()
        this.getDict(); // 字典数据
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
        // 按钮的方法
        add() {
            this.title = "add"
            this.dialogVisible = true
        },
        edit(row) {
            this.title = "edit"
            this.row = row
            this.dialogVisible = true
        },
        // 多选框的返回数据
        selected(value) {
            this.sels = value
        },
        // 删除
        delete(row, fn) {
            this.$confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除培训编号为" + row.id) + "的培训", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(async () => {
                const params = {
                    busiCode: 1001,
                    ids: typeof fn === "function" ? row : [row.id],
                    tranCode: "362104",
                };
                await trainApi.infoDelete(params).then((res) => {
                    if (res.respType === 1) {
                        this.$message({
                            type: "success",
                            message: "删除成功!",
                        });
                        if (typeof fn === "function") {
                            fn()
                        }
                        this.getList();
                    }
                });
            });
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
        // 详情
        detail(row) {
            this.$router.push({
                path: "trainDetail",
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
                tranCode: "362103",
                status: this.search.data.status,
                trainName: this.search.data.trainName,
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
