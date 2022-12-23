<template>
    <div class="role-manage">
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
                >修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseRoles">
                    删除
                </el-button>
            </el-col>
            <!-- <el-col :span="1.5">
                <el-button type="warning" icon="el-icon-download" size="mini">导出</el-button>
            </el-col> -->
        </el-row>
        <base-table :data="roleList" :columns="columns" @selection-change="handleSelectionChange" />
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
        <role-manage :visible.sync="addEditVisible" :type="addEditType" :row="row" @success="getList" />
        <DataAccessDialog :visible.sync="dataAccessVisible" :row="row" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import DataAccessDialog from "./DataAccessDialog.vue";
import { role } from "@/api";
import RoleManage from "@/views/user/role/role-manage";

export default {
    name: "RoleIndex",
    components: { RoleManage, BaseForm, BaseTable, DataAccessDialog },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            row: null,
            dataAccessVisible: false,
            form: {
                roleName: "",
                roleKey: "",
                status: "",
                date: [],
            },
            roleList: [],
            columns: [],
            components: [],
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
            selection: [],
        };
    },
    computed: {},
    created() {
        this.initCom();
        this.initColumn();
    },
    methods: {
        showAddEditDialog(type, row) {
            if (type === "edit" && row.roleKey.toLowerCase() === "admin") return;
            this.addEditVisible = true;
            this.addEditType = type;
            this.row = row ? Object.assign(row) : row;
        },
        async getList() {
            try {
                const {
                    form: { roleName, roleKey, status, date },
                    paging: { pageNo, pageSize },
                } = this;
                const params = {
                    pageNo,
                    pageSize,
                    endedTime: (date && date[1]) || "",
                    roleKey: roleKey,
                    startTime: (date && date[0]) || "",
                    roleName,
                    status,
                };
                const { respData } = await role.getRoleList(params);
                this.roleList = respData.list || [];
                this.paging.total = respData.total;
            } catch (error) {
                console.log(error);
            }
        },
        deleteChoseRoles() {
            const ids = this.selection.map((item) => item.roleId);
            this.deleteRoles(ids, () => {
                this.selection = [];
            });
        },
        deleteRoles(ids, fn) {
            this.$modal.confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除角色编号" + ids) + "的数据项").then(async () => {
                try {
                    await role.deleteRoles({
                        rolesId: ids,
                    });
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                    fn?.();
                } catch (error) {
                    console.log(error);
                }
            });
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        initCom() {
            this.components = [
                {
                    label: "角色代码：",
                    prop: "roleKey",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入角色代码",
                    },
                },
                {
                    label: "角色名称：",
                    prop: "roleName",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入角色名称",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        width: "140px",
                        placeholder: "角色状态",
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
                { type: "selection", width: 55, align: "center" },
                // { label: "角色编号", prop: "roleId", width: 120 },
                { label: "角色代码", prop: "roleKey", width: 150 },
                { label: "角色名称", prop: "roleName", width: 150 },
                { label: "显示顺序", prop: "roleSort", width: 100, align: "center" },
                {
                    label: "状态",
                    prop: "status",
                    width: 100,
                    align: "center",
                    render: (h, { row }) => {
                        return h("el-switch", {
                            props: { value: row.status, activeValue: 1, inactiveValue: 0 },
                            on: {
                                change: () => {
                                    const { roleId, roleName, status } = row;
                                    const text = status === 0 ? "启用" : "停用";
                                    const newState = status === 0 ? 1 : 0;
                                    this.$modal.confirm('确认要"' + text + '""' + roleName + '"角色吗？').then(async () => {
                                        try {
                                            await role.updateRole({
                                                roleId: roleId,
                                                status: newState,
                                            });
                                            row.status = newState;
                                            this.$modal.msgSuccess(text + "成功");
                                        } catch (error) {
                                            console.log(error);
                                        }
                                    });
                                },
                            },
                        });
                    },
                },
                { label: "创建时间", prop: "createTime", width: 150 },
                {
                    type: "operate",
                    align: "center",
                    label: "操作",
                    render: (h, { row }) => {
                        if (row.roleKey.toLowerCase() === "admin") return null;
                        return h("div", [
                            h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-edit" },
                                    on: {
                                        click: () => {
                                            this.showAddEditDialog("edit", row);
                                        },
                                    },
                                },
                                "修改"
                            ),
                            h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-delete" },
                                    on: {
                                        click: () => this.deleteRoles([row.roleId]),
                                    },
                                },
                                "删除"
                            ),
                            // h(
                            //     "el-dropdown",
                            //     {
                            //         props: {
                            //             size: "mini",
                            //         },
                            //         on: {
                            //             command: (command) => {
                            //                 if (command === "handleDataScope") {
                            //                     this.dataAccessVisible = true;
                            //                     this.row = row;
                            //                 }
                            //             },
                            //         },
                            //     },
                            //     [
                            //         h("span", { class: "el-dropdown-link" }, [
                            //             h("i", { class: "el-icon-d-arrow-right el-icon--right" }),
                            //             h("span", "更多"),
                            //         ]),
                            //         h("el-dropdown-menu", { slot: "dropdown" }, [
                            //             h("el-dropdown-item", { props: { command: "handleDataScope", icon: "el-icon-circle-check" } }, "数据权限"),
                            //             h("el-dropdown-item", { props: { command: "handleAuthUser", icon: "el-icon-user" } }, "分配用户"),
                            //         ]),
                            //     ]
                            // ),
                        ]);
                    },
                },
            ];
        },
    },
};
</script>

<style lang="scss" scoped></style>
