<template>
    <div class="department-manage">
        <base-form size="small" :model="form" show-search :components="components" @search="getList" />
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" icon="el-icon-plus" size="mini" @click="showAddEditDialog('add', null)">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="info" icon="el-icon-sort" size="mini" @click="toggleExpandAll">展开/折叠</el-button>
            </el-col>
        </el-row>
        <base-table
            v-if="refreshTable"
            v-loading="loading"
            :data="deptList"
            :columns="columns"
            row-key="deptId"
            :default-expand-all="isExpandAll"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        />
        <dept-manage :visible.sync="addEditVisible" :type="addEditType" :row="addEditRow" :dept-list="deptList" @success="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { dept } from "@/api";
import DeptManage from "@/views/user/dept/dept-manage";

export default {
    name: "Department",
    components: { DeptManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            addEditRow: null,
            data: [],
            form: {
                deptName: "",
                status: "",
            },
            columns: [],
            deptList: [],
            components: [],
            loading: false,
            // 重新渲染表格状态
            refreshTable: true,
            // 是否展开，默认全部折叠
            isExpandAll: false,
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
            this.addEditRow = row ? Object.assign(row) : row;
        },
        toggleExpandAll() {
            this.refreshTable = false;
            this.isExpandAll = !this.isExpandAll;
            this.$nextTick(() => {
                this.refreshTable = true;
            });
        },
        deleteDept(row, fn) {
            if (row?.children?.length > 0) {
                this.$modal.msgWarning("存在子菜单无法删除");
                return;
            }
            this.$modal.confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除部门为" + row.deptName) + "的数据项").then(async () => {
                try {
                    await dept.deleteDept({
                        deptIds: [row.deptId],
                    });
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                    fn?.();
                } catch (error) {
                    console.log(error);
                }
            });
        },
        async getList() {
            try {
                this.loading = true;
                const { respData } = await dept.getDeptList({
                    ...this.form,
                    status: this.form.status !== "" ? this.form.status : null,
                });
                this.deptList = this.handleTree(respData || [], "deptId");
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        initCom() {
            this.components = [
                {
                    label: "部门名称：",
                    prop: "deptName",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入部门名称",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        placeholder: "部门状态",
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
                { label: "部门名称", prop: "deptName", width: 260 },
                { label: "部门代码", prop: "deptCode", width: 260 },
                { label: "显示排序", prop: "sortNo", width: 200, align: "center" },
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
                { label: "创建时间", prop: "createTime", width: 200, align: "center" },
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
                                    props: { size: "mini", type: "text", icon: "el-icon-plus" },
                                    on: {
                                        click: () => {
                                            let parentId = 0;
                                            if (row != null && row.deptId) {
                                                parentId = row.deptId;
                                            }
                                            this.showAddEditDialog("add", { parentId });
                                        },
                                    },
                                },
                                "新增"
                            ),
                            h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-delete" },
                                    on: {
                                        click: () => this.deleteDept(row),
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
