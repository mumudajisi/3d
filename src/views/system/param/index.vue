<template>
    <div class="param-manage">
        <base-form size="small" :model="form" show-search :components="components" @search="getList" @keyup.enter.native="getList" @reset="getList" />
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" icon="el-icon-plus" size="mini" @click="showAddEditDialog('add', null)">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="success"
                    icon="el-icon-edit"
                    size="mini"
                    :disabled="selection.length !== 1"
                    @click="showAddEditDialog('edit', selection[0])"
                >修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseParams">
                    删除
                </el-button>
            </el-col>
            <!-- <el-col :span="1.5"> <el-button type="warning" icon="el-icon-download" size="mini">导出</el-button> </el-col> -->
            <!-- <el-col :span="1.5">
                <el-button type="danger" icon="el-icon-refresh" size="mini" @click="handleRefreshCache">刷新缓存</el-button>
            </el-col> -->
        </el-row>
        <base-table v-loading="loading" :data="paramList" :columns="columns" @selection-change="handleSelectionChange" />
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
        <param-manage :visible.sync="addEditVisible" :type="addEditType" :row="row" @success="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { param } from "@/api";
import ParamManage from "@/views/system/param/param-manage";

export default {
    name: "ParamIndex",
    components: { ParamManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            row: null,
            form: {
                paramName: "",
                paramKey: "",
                paramType: "",
                date: [],
            },
            columns: [],
            paramList: [],
            components: [],
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
        this.getList();
    },
    methods: {
        showAddEditDialog(type, row) {
            this.addEditVisible = true;
            this.addEditType = type;
            this.row = row ? Object.assign(row) : row;
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        async getList() {
            try {
                this.loading = true;
                const { date, ...otherForm } = this.form;
                const { respData } = await param.getParamList({
                    ...otherForm,
                    startTime: (date && date[0]) || "",
                    endedTime: (date && date[1]) || "",
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                });
                this.paramList = respData.list || [];
                this.paging.total = respData.total || 0;
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        deleteParams(ids, fn) {
            this.$modal.confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除参数编号为" + ids) + "的数据项").then(async () => {
                try {
                    await param.deleteParams({
                        ids: ids,
                    });
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                    fn?.();
                } catch (error) {
                    console.log(error);
                }
            });
        },
        deleteChoseParams() {
            const ids = this.selection.map((item) => item.id);
            this.deleteParams(ids, () => {
                this.selection = [];
            });
        },
        handleRefreshCache() {},
        initCom() {
            this.components = [
                {
                    label: "参数名称：",
                    prop: "paramName",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入参数名称",
                    },
                },
                {
                    label: "参数键名：",
                    prop: "paramKey",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入参数键名",
                    },
                },
                {
                    component: "el-select",
                    label: "状态：",
                    prop: "paramType",
                    componentProp: {
                        placeholder: "系统内置",
                    },
                    selectOption: [
                        { label: "内置", value: 1 },
                        { label: "外部", value: 2 },
                    ],
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
                // { label: "参数主键", prop: "id", width: 100, align: "center" },
                { label: "参数名称", prop: "paramName", width: 200 },
                { label: "参数键名", prop: "paramKey", width: 200 },
                { label: "参数健值", prop: "paramValue", width: 300 },
                {
                    label: "系统内置",
                    prop: "paramType",
                    width: 100,
                    align: "center",
                    render: (h, { row }) => {
                        return h(
                            "el-tag",
                            {
                                props: { type: row.paramType === 1 ? "" : "danger" },
                            },
                            row.paramType === 1 ? "是" : "否"
                        );
                    },
                },
                // { label: "备注", prop: "remark", width: 250 },
                { label: "创建时间", prop: "createTime", width: 200, align: "center" },
                {
                    type: "operate",
                    align: "center",
                    label: "操作",
                    width: 200,
                    render: (h, { row }) => {
                        return h("div", [
                            h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-edit" },
                                    on: {
                                        click: () => this.showAddEditDialog("edit", row),
                                    },
                                },
                                "修改"
                            ),
                            h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-delete" },
                                    on: {
                                        click: () => this.deleteParams([row.id]),
                                    },
                                },
                                "删除"
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
