<template>
    <div class="menu-manage">
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
            :data="menuList"
            :columns="columns"
            row-key="menuId"
            :default-expand-all="isExpandAll"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        />
        <menu-manage :visible.sync="addEditVisible" :type="addEditType" :row="addEditRow" @success="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import Icon from "@/components/Icon/Icon.vue";
import { menu } from "@/api";
import MenuManage from "@/views/system/menu/menu-manage";

export default {
    name: "MenuIndex",
    components: { MenuManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            addEditRow: null,
            form: {
                menuName: "",
                status: "",
            },
            loading: false,
            menuList: [],
            // 重新渲染表格状态
            refreshTable: true,
            // 是否展开，默认全部折叠
            isExpandAll: false,
            columns: [],
            components: [],
        };
    },
    computed: {},
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
        deleteMenu(row, fn) {
            if (row?.children?.length > 0) {
                this.$modal.msgWarning("存在子菜单无法删除");
                return;
            }
            this.$modal.confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除菜单名称为" + row.menuName) + "的数据项").then(async () => {
                try {
                    await menu.deleteMenu({
                        menusId: [row.menuId],
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
                const { respData } = await menu.getMenuList({
                    ...this.form,
                    status: this.form.status !== "" ? this.form.status : null,
                });
                this.menuList = this.handleTree(respData || [], "menuId");
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        initCom() {
            this.components = [
                {
                    label: "菜单名称：",
                    prop: "menuName",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入菜单名称",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        width: "140px",
                        placeholder: "菜单状态",
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
                { label: "菜单名称", prop: "menuName", width: 300 },
                {
                    label: "图标",
                    prop: "icon",
                    width: 100,
                    align: "center",
                    render: (h, { row }) => {
                        return h(Icon, { props: { icon: row.icon }});
                    },
                },
                { label: "排序", prop: "orderNum", width: 150, align: "center" },
                { label: "权限标识", prop: "perms", width: 320 },
                {
                    label: "状态",
                    prop: "status",
                    width: 80,
                    align: "center",
                    render: (h, { row }) => {
                        return h(
                            "el-tag",
                            {
                                props: { type: row.status === "1" ? "" : "danger" },
                            },
                            row.status === "1" ? "正常" : "停用"
                        );
                    },
                },
                { label: "创建时间", prop: "createTime", width: 320, align: "center" },
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
                                            if (row != null && row.menuId) {
                                                parentId = row.menuId;
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
                                        click: () => this.deleteMenu(row),
                                    },
                                },
                                "删除"
                            ),
                        ]);
                    },
                },
            ];
        },
        addMenu(row) {
            let parentId = 0;
            if (row != null && row.menuId) {
                parentId = row.menuId;
            }
            this.showAddEditDialog("add", { parentId });
        },
    },
};
</script>

<style lang="scss" scoped></style>
