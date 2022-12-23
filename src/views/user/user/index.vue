<template>
    <div class="user-manage">
        <el-row :gutter="20">
            <!--部门数据-->
            <el-col :span="4" :xs="24">
                <div class="head-container">
                    <el-input
                        v-model="deptName"
                        placeholder="请输入部门名称"
                        clearable
                        size="small"
                        prefix-icon="el-icon-search"
                        style="margin-bottom: 20px"
                    />
                </div>
                <div class="head-container">
                    <el-tree
                        ref="tree"
                        :data="deptOptions"
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
            <!--用户数据-->
            <el-col :span="20" :xs="24">
                <base-form size="small" :model="form" show-search :components="components" :hidden-num="4" @search="handleQuery" />
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
                        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseUsers">
                            删除
                        </el-button>
                    </el-col>
                    <!--                    <el-col :span="1.5">-->
                    <!--                        <el-button type="info" icon="el-icon-upload2" size="mini">导入</el-button>-->
                    <!--                    </el-col>-->
                    <!-- <el-col :span="1.5">
                        <el-button type="warning" icon="el-icon-download" size="mini">导出</el-button>
                    </el-col> -->
                </el-row>
                <base-table v-loading="loading" :data="userList" :columns="columns" @selection-change="handleSelectionChange" />
                <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <user-manage :visible.sync="addEditVisible" :type="addEditType" :row="row" :dept-options="deptOptions" @success="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { dept, user } from "@/api";
import UserManage from "@/views/user/user/user-manage";

export default {
    name: "UserIndex",
    components: { UserManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            loading: false,
            row: null,
            // 查询参数
            form: {
                userName: "",
                phonenumber: "",
                status: "",
                dept: "",
                isDelete: 0,
                date: [],
            },
            components: [],
            columns: [],
            userList: [],
            deptName: "",
            // 部门树选项
            deptOptions: [],
            defaultProps: {
                children: "children",
                label: "name",
            },
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
            selection: [],
        };
    },
    watch: {
        // 根据名称筛选部门树
        deptName(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        this.initCom();
        this.initColumn();
        this.getTreeselect();
        this.getList();
    },
    methods: {
        showAddEditDialog(type, row) {
            if (type === "edit" && (row.userName || "").toLowerCase() === "admin") return;
            this.addEditVisible = true;
            this.addEditType = type;
            this.row = row ? Object.assign(row) : row;
        },
        reset() {
            this.form.dept = "";
            const select = this.$refs["tree"].$el.querySelector(".is-current");
            if (select) {
                select.classList.remove("is-current");
            }
            this.handleQuery();
        },
        // 筛选节点
        filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.form.dept = data.id;
            this.handleQuery();
        },
        /** 查询部门下拉树结构 */
        async getTreeselect() {
            try {
                const { respData } = await dept.getDeptTree();
                this.deptOptions = respData;
            } catch (error) {
                console.log(error);
            }
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        handleQuery() {
            this.paging.pageNo = 1;
            this.getList();
        },
        deleteChoseUsers() {
            const ids = this.selection.map((item) => item.id);
            this.deleteUsers(ids, () => {
                this.selection = [];
            });
        },
        deleteUsers(ids, fn) {
            this.$modal.confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除用户编号为" + ids) + "的数据项").then(async () => {
                try {
                    await user.deleteUser({
                        userIds: ids,
                    });
                    this.$modal.msgSuccess("删除成功");
                    this.getList();
                    fn?.();
                } catch (error) {
                    console.log(error);
                }
            });
        },
        /** 重置密码按钮操作 */
        handleResetPwd(row) {
            this.$modal.confirm('确认重置"' + row.userName + '"的密码吗？').then(async () => {
                try {
                    await user.resetPwd({ id: row.id });
                    this.$modal.msgSuccess("重置成功");
                    this.getList();
                } catch (error) {
                    console.log(error);
                }
            });
        },
        async getList() {
            try {
                this.loading = true;
                const { paging, form } = this;
                const { respData } = await user.getUserList({
                    pageNum: paging.pageNo,
                    pageSize: paging.pageSize,
                    mobile: form.phonenumber,
                    status: form.status,
                    userName: form.userName,
                    dept: form.dept,
                    isDelete: form.isDelete,
                    startTime: (form.date && form.date[0]) || "",
                    endedTime: (form.date && form.date[1]) || "",
                });
                this.userList = respData.list || [];
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
                    label: "用户名称：",
                    prop: "userName",
                    component: "el-input",
                    componentProp: {
                        width: "180px",
                        placeholder: "请输入用户名称",
                    },
                },
                {
                    label: "手机号码：",
                    prop: "phonenumber",
                    component: "el-input",
                    componentProp: {
                        width: "150px",
                        placeholder: "请输入手机号码",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        width: "140px",
                        placeholder: "用户状态",
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
                        width: "240px",
                        type: "daterange",
                        startPlaceholder: "开始日期",
                        endPlaceholder: "结束日期",
                        valueFormat: "yyyy-MM-dd",
                    },
                },
                {
                    component: "el-select",
                    label: "是否删除：",
                    prop: "isDelete",
                    componentProp: {
                        width: "140px",
                        placeholder: "用户状态",
                    },
                    selectOption: [
                        { label: "是", value: 1 },
                        { label: "否", value: 0 },
                    ],
                },
            ];
        },
        initColumn() {
            this.columns = [
                { type: "selection", width: 50, align: "center" },
                { label: "用户账号", prop: "userId", width: 100 },
                { label: "用户名称", prop: "userName", width: 150 },
                { label: "手机号码", prop: "mobile", width: 120 },
                { label: "所属部门", prop: "deptName", width: 200 },
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
                                    const text = row.status === 0 ? "启用" : "停用";
                                    this.$modal
                                        .confirm('确认要"' + text + '""' + row.userName + '"用户吗？')
                                        .then(async () => {
                                            try {
                                                await user.updateUser({
                                                    id: row.id,
                                                    status: row.status === 0 ? 1 : 0,
                                                });
                                                row.status = row.status === 0 ? 1 : 0;
                                                this.$modal.msgSuccess(text + "成功");
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        })
                                        .catch(() => {});
                                },
                            },
                        });
                    },
                },
                {
                    label: "是否删除",
                    prop: "isDelete",
                    width: 80,
                    align: "center",
                    render: (h, { row }) => {
                        return h("el-switch", {
                            props: { value: row.isDelete, activeValue: 1, inactiveValue: 0, activeColor: "#ff0000" },
                            on: {
                                change: () => {
                                    const text = row.isDelete === 0 ? "删除" : "恢复";
                                    this.$modal
                                        .confirm('是否"' + text + '""' + row.userName + '"用户吗？')
                                        .then(async () => {
                                            try {
                                                await user.updateUser({
                                                    id: row.id,
                                                    isDelete: row.isDelete === 0 ? 1 : 0,
                                                });
                                                this.getList();
                                                this.$modal.msgSuccess(text + "成功");
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        })
                                        .catch(() => {});
                                },
                            },
                        });
                    },
                },
                { label: "创建时间", prop: "createTime", width: 160, align: "center" },
                {
                    type: "operate",
                    align: "center",
                    label: "操作",
                    render: (h, { row }) => {
                        if ((row.userName || "").toLowerCase() === "admin") return null;
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
                                        click: () => this.deleteUsers([row.id]),
                                    },
                                },
                                "删除"
                            ),
                            h(
                                "el-dropdown",
                                {
                                    props: {
                                        size: "mini",
                                    },
                                    on: {
                                        command: (command) => this[command]?.(row),
                                    },
                                },
                                [
                                    h("span", { class: "el-dropdown-link" }, [
                                        h("i", { class: "el-icon-d-arrow-right el-icon--right" }),
                                        h("span", "更多"),
                                    ]),
                                    h("el-dropdown-menu", { slot: "dropdown" }, [
                                        h("el-dropdown-item", { props: { command: "handleResetPwd", icon: "el-icon-key" }}, "重置密码"),
                                        // h("el-dropdown-item", { props: { command: "handleAuthRole", icon: "el-icon-circle-check" } }, "分配角色"),
                                    ]),
                                ]
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
