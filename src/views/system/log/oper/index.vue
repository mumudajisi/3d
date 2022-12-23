<template>
    <div class="operate-log">
        <base-form size="small" :model="form" show-search :components="components" :hidden-num="4" @search="getList" />
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                    type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteLog"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="clearLog">清空</el-button>
            </el-col>
            <!-- <el-col :span="1.5">
                <el-button type="warning" icon="el-icon-download" size="mini">导出</el-button>
            </el-col> -->
        </el-row>
        <base-table v-loading="loading" :data="operateLogList" :columns="columns" @selection-change="handleSelectionChange" />
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
        <oper-detail :visible.sync="visible" :row="row" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { log } from "@/api";
import OperDetail from "@/views/system/log/oper/oper-detail";

export default {
    name: "OperLog",
    components: { OperDetail, BaseForm, BaseTable },
    data() {
        return {
            visible: false,
            row: null,
            form: {
                traceId: "",
                clientIp: "",
                reqParam: "",
                status: "",
                date: [],
            },
            components: [],
            operateLogList: [],
            columns: [],
            loading: false,
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
            selection: [],
        };
    },
    created() {
        this.initCom();
        this.initColumn();
    },
    methods: {
        deleteLog() {
            const ids = this.selection.map((item) => item.id);
            const message = "是否确认批量删除选中的操作日志数据项";
            this.$modal.confirm(message).then(async () => {
                try {
                    await log.deleteOperateLog({ ids: ids })
                    await this.getList()
                    this.selection = []
                    this.$modal.msgSuccess("删除操作日志成功")
                } catch (error) {
                    console.log(error);
                }
            });
        },
        clearLog() {
            const message = "是否确认清空所有操作日志数据项？";
            this.$modal.confirm(message).then(async () => {
                try {
                    await log.clearOperLog();
                    await this.getList();
                    this.selection = [];
                    this.$modal.msgSuccess("清空操作日志成功");
                } catch (error) {
                    console.log(error);
                }
            });
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        showDetail(row) {
            this.visible = true;
            this.row = Object.assign({}, row);
        },
        async getList() {
            try {
                this.loading = true;
                const { date, ...otherForm } = this.form;
                const { respData } = await log.getOperateLogList({
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                    startTime: (date && date[0]) || "",
                    endedTime: (date && date[1]) || "",
                    ...otherForm,
                });
                this.operateLogList = respData.list || [];
                this.paging.total = respData.total || 0;
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        initCom() {
            this.components = [
                {
                    label: "日志索引号：",
                    prop: "logId",
                    component: "el-input",
                    componentProp: {
                        width: "200px",
                        placeholder: "请输入日志索引号",
                    },
                },
                {
                    label: "客户端IP：",
                    prop: "clientIp",
                    component: "el-input",
                    componentProp: {
                        width: "200px",
                        placeholder: "请输入客户端IP",
                    },
                },
                {
                    label: "请求字段：",
                    prop: "reqParam",
                    component: "el-input",
                    componentProp: {
                        width: "200px",
                        placeholder: "请输入请求字段",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        width: "140px",
                        placeholder: "状态",
                        type: "trans_status",
                    },
                    on: {
                        finished: () => {
                            this.getList();
                        },
                    },
                },
                {
                    component: "el-date-picker",
                    label: "创建时间：",
                    prop: "date",
                    componentProp: {
                        width: "250px",
                        type: "daterange",
                        startPlaceholder: "开始日期",
                        endPlaceholder: "结束日期",
                        valueFormat: "yyyy-MM-dd",
                    },
                },
            ];
        },
        initColumn() {
            this.columns = [
                { type: "selection", width: 50, align: "center" },
                { label: "日志索引号", prop: "traceId", width: 150, align: "center" },
                { label: "业务代码", prop: "tranCode", width: 150, align: "center" },
                { label: "业务名称", prop: "tranName", width: 190 },
                { label: "客户端IP", prop: "clientIp", width: 100, align: "center" },
                { label: "IP归属地", prop: "ipAddr", width: 150, align: "center" },
                { label: "服务IP", prop: "serverIp", width: 100, align: "center" },
                {
                    label: "状态",
                    prop: "status",
                    width: 100,
                    align: "center",
                    render: (h, { row }) => {
                        return h(
                            "el-tag",
                            {
                                props: { type: row.status === 1 ? "" : "danger" },
                            },
                            row.status === 1 ? "成功" : "失败"
                        );
                    },
                },
                { label: "耗时(ms)", prop: "tranCost", width: 100, align: "right" },
                { label: "返回信息", prop: "respDesc" },
                { label: "操作日期", prop: "createTime", width: 160, align: "center" },
                {
                    type: "operate",
                    align: "center",
                    label: "操作",
                    width: 130,
                    render: (h, { row }) => {
                        return h("div", [
                            h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-view" },
                                    on: {
                                        click: () => this.showDetail(row),
                                    },
                                },
                                "详细"
                            ),
                        ]);
                    },
                },
            ];
        },
    },
};
</script>

<style lang="scss" scoped></style>
