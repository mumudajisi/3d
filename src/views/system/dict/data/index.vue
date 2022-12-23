<template>
    <div class="dict-manage">
        <el-row :gutter="20">
            <el-col :span="4" :xs="24">
                <div class="head-container">
                    <el-input
                        v-model="dictName"
                        placeholder="请输入字典名称"
                        clearable
                        size="small"
                        prefix-icon="el-icon-search"
                        style="margin-bottom: 20px"
                    />
                </div>
                <div class="head-container">
                    <el-tree
                        ref="tree"
                        :data="dictTreeList"
                        :props="defaultProps"
                        :expand-on-click-node="false"
                        :filter-node-method="filterNode"
                        node-key="id"
                        default-expand-all
                        highlight-current
                        @node-click="handleNodeClick"
                    />
                </div>
            </el-col>
            <el-col :span="20" :xs="24">
                <base-form size="small" :model="form" show-search :components="components" @search="getList" @reset="reset" />
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
                        >
                            修改
                        </el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseDicts">
                            删除
                        </el-button>
                    </el-col>
                    <!-- <el-col :span="1.5"> <el-button type="warning" icon="el-icon-download" size="mini">导出</el-button></el-col> -->
                    <!-- <el-col :span="1.5">
                        <el-button type="danger" icon="el-icon-refresh" size="mini" @click="handleRefreshCache">刷新缓存</el-button>
                    </el-col> -->
                </el-row>
                <base-table v-loading="loading" :data="paramList" :columns="columns" @selection-change="handleSelectionChange" />
                <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <dict-data-manage :visible.sync="addEditVisible" :type="addEditType" :row="addEditRow" @success="handleOperateSuccess" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { dict } from "@/api";
import DictDataManage from "@/views/system/dict/data/dict-data-manage";

export default {
    name: "DictData",
    components: { DictDataManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            addEditRow: null,
            dictName: "",
            dictTreeList: [],
            defaultProps: { children: "children", label: "name" },
            form: {
                dictCode: "",
                status: "",
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
    watch: {
        dictName(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        this.initCom();
        this.initColumn();
        this.getDictTreeList();
    },
    methods: {
        // 筛选节点
        filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.form.dictCode = data.dictCode;
            this.getList();
        },
        reset() {
            this.form.dictCode = "";
            const select = this.$refs["tree"].$el.querySelector(".is-current");
            if (select) {
                select.classList.remove("is-current");
            }
        },
        showAddEditDialog(type, row) {
            this.addEditVisible = true;
            this.addEditType = type;
            this.addEditRow = row ? Object.assign(row) : row;
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        handleOperateSuccess() {
            this.getList();
            this.getDictTreeList();
        },
        async getList() {
            try {
                this.loading = true;
                const { date, ...otherForm } = this.form;
                const { respData } = await dict.getDictList({
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
        async getDictTreeList() {
            try {
                const { respData } = await dict.getDictTree();
                this.dictTreeList = respData || [];
            } catch (error) {
                console.log(error);
            }
        },
        deleteDicts(ids, fn) {
            this.$modal.confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除字典编号为" + ids) + "的数据项").then(async () => {
                try {
                    await dict.deleteDict({
                        ids: ids,
                    });
                    this.getList();
                    this.getDictTreeList();
                    this.$modal.msgSuccess("删除成功");
                    fn?.();
                } catch (error) {
                    console.log(error);
                }
            });
        },
        deleteChoseDicts() {
            const ids = this.selection.map((item) => item.id);
            this.deleteDicts(ids, () => {
                this.selection = [];
            });
        },
        handleRefreshCache() {},
        initCom() {
            this.components = [
                {
                    label: "字典类型：",
                    prop: "dictCode",
                    component: "el-input",
                    componentProp: {
                        width: "200px",
                        placeholder: "请输入字典类型",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        width: "150px",
                        placeholder: "字典状态",
                        type: "component_status",
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
                // { label: "字典编号", prop: "id", width: 100, align: "center" },
                { label: "字典名称", prop: "dictName", width: 180, align: "left" },
                {
                    label: "字典类型",
                    prop: "dictCode",
                    width: 180,
                    align: "left",
                    render: (h, { row }) => {
                        return h("router-link", { class: "link-type", props: { to: "/system/dict-data/" + row.dictCode }}, row.dictCode);
                        // return h("div", { class: "link-type", props: { to: "/system-manage/dict-data/" + row.id } }, row.dictCode);
                    },
                },
                { label: "显示排序", prop: "dictSort", width: 100, align: "center" },
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
                // { label: "备注", prop: "remark" },
                { label: "创建时间", prop: "createTime", width: 180, align: "center" },
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
                                    props: { size: "mini", type: "text", icon: "el-icon-view" },
                                    on: {
                                        click: () => this.$router.push("/system/dict-data/" + row.dictCode),
                                    },
                                },
                                "数据"
                            ),
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
                                        click: () => this.deleteDicts([row.id]),
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
