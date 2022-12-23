<template>
    <div class="entry-type-manage">
        <el-row :gutter="20">
            <el-col :span="4" :xs="24">
                <div class="head-container">
                    <el-input
                        v-model="knowTypeCode"
                        placeholder="请输入词条类别名称"
                        clearable
                        size="small"
                        prefix-icon="el-icon-search"
                        style="margin-bottom: 20px"
                    />
                </div>
                <div class="head-container">
                    <el-tree
                        ref="tree"
                        :data="knowTypeTreeList"
                        :props="defaultProps"
                        :expand-on-click-node="false"
                        :filter-node-method="filterNode"
                        node-key="id"
                        :default-expanded-keys="treeData"
                        highlight-current
                        accordion
                        @node-click="handleNodeClick"
                    />
                </div>
            </el-col>
            <el-col :span="20" :xs="24">
                <base-form size="small" :model="form" show-search :components="components" @search="getList" />
                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button v-permission="['know:type:add']" type="primary" icon="el-icon-plus" size="mini" @click="showAddEditDialog('add', null)">新增</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button
                            v-permission="['know:type:edit']"
                            type="success"
                            icon="el-icon-edit"
                            size="mini"
                            :disabled="selection.length !== 1"
                            @click="showAddEditDialog('edit', selection[0])"
                        >修改</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button v-permission="['know:type:delete']" type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseKnows">
                            删除
                        </el-button>
                    </el-col>
                </el-row>
                <base-table v-loading="loading" :data="knowList" :columns="columns" @selection-change="handleSelectionChange" />
                <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <know-type-manage :visible.sync="addEditVisible" :type="addEditType" :row="row" @success="handleOperateSuccess" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { know } from "@/api";
import KnowTypeManage from "@/views/know/type/know-type-manage";

export default {
    name: "EntryTypeManage",
    components: { KnowTypeManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            row: null,
            knowTypeCode: "",
            knowTypeTreeList: [],
            defaultProps: { children: "children", label: "name" },
            form: {
                knowTypeName: "",
                knowTypeCode: "",
                parentId: "",
                date: [],
            },
            components: [],
            columns: [],
            selection: [],
            knowList: [],
            loading: false,
            chooseNode: null,
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
            knowTypeList: [],
            treeMap: {},
            treeData: [],
        };
    },
    watch: {
        knowTypeCode(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        (async () => {
            await this.getList();
            await this.getTypeTree();
            this.initCom();
            this.initColumn();
        })();
    },
    methods: {
        showAddEditDialog(type, row) {
            this.addEditVisible = true;
            this.addEditType = type;
            this.row = row ? Object.assign(row) : this.chooseNode ? { parentId: this.chooseNode.id } : row;
        },
        // 筛选节点
        filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        handleNodeClick(data) {
            this.chooseNode = Object.assign({}, { ...data });
            this.form.parentId = data.id;
            this.getList();
        },
        reset() {
            this.form.parentId = "";
            const select = this.$refs["tree"].$el.querySelector(".is-current");
            this.chooseNode = null;
            if (select) {
                select.classList.remove("is-current");
            }
            this.getList()
        },
        handleOperateSuccess() {
            this.getList();
            this.getTypeTree();
        },
        deleteKnows(ids, msg, fn) {
            this.$modal.confirm(msg).then(async () => {
                try {
                    await know.deleteKnows({
                        ids: ids,
                    });
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                    fn?.();
                } catch (error) {
                    console.log(error);
                } finally {
                    this.getTypeTree();
                }
            });
        },
        deleteChoseKnows() {
            const ids = this.selection.map((item) => item.id);
            this.deleteKnows(ids, "是否批量删除选中数据", () => {
                this.selection = [];
            });
        },
        getTreeMap(treeList) {
            treeList.forEach(item => {
                const key = String(item.id);
                const val = String(item.name);
                this.treeMap[key] = val;
                if (item.children) {
                    this.getTreeMap(item.children);
                }
            })
        },
        async getTypeTree() {
            try {
                const { respData } = await know.getTypeTree();
                this.knowTypeTreeList = respData || [];
                this.knowTypeTreeList.forEach(element => {
                    this.treeData.push(element.id)
                });
                this.getTreeMap(this.knowTypeTreeList)
            } catch (error) {
                console.log(error);
            }
        },
        async getList() {
            try {
                this.loading = true;
                const { date, ...other } = this.form;
                const { respData } = await know.getKnowList({
                    ...other,
                    startTime: (date && date[0]) || "",
                    endedTime: (date && date[1]) || "",
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                });
                this.knowList = respData.list || [];
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
                    label: "词条标题：",
                    prop: "knowTypeName",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入词条标题",
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
                {
                    label: "类别名称",
                    prop: "knowTypeName",
                    width: 200,
                    render: (h, { row }) => {
                        return h(
                            "div",
                            {
                                class: "flex-align-center",
                            },
                            [
                                h("el-image", {
                                    style: "width: 40px;height: 40px;margin-right: 10px;",
                                    props: {
                                        src: process.env.VUE_APP_RESOURCE_SERVER + row.knowTypeIcon + "?" + Math.random(),
                                        previewSrcList: [process.env.VUE_APP_RESOURCE_SERVER + row.knowTypeIcon + "?" + Math.random()],
                                        lazy: true,
                                    },
                                }),
                                h("span", row.knowTypeName),
                            ]
                        );
                    },
                },
                { label: "父级类别", prop: "parentId", width: 100, align: "center",
                    render: (f, { row }) => {
                        return f("span", this.treeMap[row.parentId])
                    }
                },
                { label: "备注", prop: "remark", width: 220, align: "center" },
                { label: "创建时间", prop: "createTime", width: 160, align: "center"
                },
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
                                        click: () => {
                                            this.$router.push("/know/data?type=" + row.id);
                                        },
                                    },
                                },
                                "数据"
                            ),
                            this.$permission(["know:type:edit"]) ? h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-edit" },
                                    on: {
                                        click: () => this.showAddEditDialog("edit", row),
                                    },
                                },
                                "修改"
                            ) : null,
                            this.$permission(["know:type:delete"]) ? h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-delete" },
                                    on: {
                                        click: () => this.deleteKnows([row.id], "是否删除" + row.knowTypeName),
                                    },
                                },
                                "删除"
                            ) : null,
                        ]);
                    },
                },
            ];
        },
    },
};
</script>

<style lang="scss" scoped></style>
