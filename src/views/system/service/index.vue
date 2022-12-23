<template>
    <div class="system-service">
        <base-form size="small" :model="form" show-search :components="components" @search="getList" />
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
                >修改
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseDicts"> 删除
                </el-button>
            </el-col>
            <!-- <el-col :span="1.5"> <el-button type="warning" icon="el-icon-download" size="mini">导出</el-button> </el-col> -->
            <!-- <el-col :span="1.5">
                <el-button type="danger" icon="el-icon-refresh" size="mini" @click="handleRefreshCache">刷新缓存</el-button>
            </el-col> -->
        </el-row>
        <base-table v-loading="loading" :data="serviceList" :columns="columns" @selection-change="handleSelectionChange" />
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
        <service-manage :visible.sync="addEditVisible" :type="addEditType" :row="row" @success="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { service } from "@/api";
import ServiceManage from "@/views/system/service/service-manage";

export default {
    name: "SystemService",
    components: { ServiceManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            row: null,
            form: {
                bizCode: "",
                transCode: "",
                transName: "",
                status: "",
            },
            components: [],
            columns: [],
            selection: [],
            serviceList: [],
            loading: false,
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
        };
    },
    created() {
        this.initCom();
        this.initColumn();
    },
    methods: {
        showAddEditDialog(type, row) {
            this.addEditVisible = true;
            this.addEditType = type;
            this.row = row ? Object.assign(row) : row;
        },
        deleteTrans(ids, fn) {
            this.$modal.confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除服务编号为" + ids) + "的数据项").then(async () => {
                try {
                    await service.deleteTrans({
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
        deleteChoseDicts() {
            const ids = this.selection.map((item) => item.id);
            this.deleteTrans(ids, () => {
                this.selection = [];
            });
        },
        async getList() {
            try {
                this.loading = true;
                const { respData } = await service.getTranList({
                    ...this.form,
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                });
                this.serviceList = respData.list || [];
                this.paging.total = respData.total || 0;
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        initCom() {
            this.components = [
                {
                    label: "业务代码：",
                    prop: "bizCode",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入业务代码",
                    },
                },
                {
                    label: "服务代码：",
                    prop: "transCode",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入服务代码",
                    },
                },
                {
                    label: "服务名称：",
                    prop: "transName",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入服务名称",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        placeholder: "字典状态",
                        type: "component_status",
                    },
                    on: {
                        finished: () => {
                            this.getList();
                        },
                    },
                },
            ];
        },
        initColumn() {
            this.columns = [
                { type: "selection", width: 50, align: "center" },
                // { label: "id", prop: "id", width: 80, align: "center" },
                { label: "业务代码", prop: "busiCode", width: 100, align: "center" },
                { label: "服务代码", prop: "tranCode", width: 100, align: "center" },
                { label: "服务名称", prop: "tranName", width: 300, align: "left" },
                { label: "服务路径", prop: "tranPath", width: 200, align: "left" },
                { label: "服务id", prop: "serverId", width: 200, align: "left" },
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
                            row.status === 1 ? "正常" : "停用"
                        );
                    },
                },
                { label: "开放日期", prop: "tranDate", width: 100, align: "center", hidden: true },
                { label: "开放时间", prop: "tranOpen", width: 100, align: "center", hidden: true },
                { label: "关闭时间", prop: "tranDown", width: 100, align: "center", hidden: true },
                { label: "创建时间", prop: "createTime", width: 160, align: "center" },
                {
                    type: "operate",
                    align: "center",
                    label: "操作",
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
                                        click: () => this.deleteTrans([row.id]),
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
