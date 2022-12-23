<template>
    <div class="model-type-manage">
        <el-row :gutter="20">
            <el-col :span="4" :xs="24">
                <div class="head-container">
                    <el-input
                        v-model="knowTypeCode"
                        placeholder="请输入模型类别名称"
                        clearable
                        size="small"
                        prefix-icon="el-icon-search"
                        style="margin-bottom: 20px"
                    />
                </div>
                <div class="head-container">
                    <el-tree
                        ref="tree"
                        :data="modelTypeTreeList"
                        :props="defaultProps"
                        :expand-on-click-node="false"
                        :filter-node-method="filterNode"
                        :default-expanded-keys="treeData"
                        node-key="id"
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
                        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseModels">
                            删除
                        </el-button>
                    </el-col>
                </el-row>
                <base-table v-loading="loading" :data="modelList" :columns="columns" @selection-change="handleSelectionChange" />
                <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <model-type-manage :visible.sync="addEditVisible" :type="addEditType" :row="row" @success="handleOperateSuccess" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { model } from "@/api";
import ModelTypeManage from "@/views/model/type/model-type-manage";

export default {
    name: "ModelType",
    components: { ModelTypeManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            row: null,
            knowTypeCode: "",
            modelTypeTreeList: [],
            defaultProps: { children: "children", label: "name" },
            form: {
                modelTypeCode: "",
                modelTypeName: "",
                parentId: "",
                date: [],
            },
            components: [],
            columns: [],
            selection: [],
            modelList: [],
            loading: false,
            chooseNode: null,
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
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
        })()
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
        deleteModels(ids, msg, fn) {
            this.$modal.confirm(msg).then(async () => {
                try {
                    await model.deleteModels({
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
        deleteChoseModels() {
            const ids = this.selection.map((item) => item.id);
            this.deleteModels(ids, "是否批量删除选中数据", () => {
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
                const { respData } = await model.getTypeTree();
                this.modelTypeTreeList = respData || [];
                this.modelTypeTreeList.forEach(element => {
                    this.treeData.push(element.id)
                });
                this.getTreeMap(this.modelTypeTreeList)
            } catch (error) {
                console.log(error);
            }
        },
        async getList() {
            try {
                this.loading = true;
                const { date, ...other } = this.form;
                const { respData } = await model.getModelList({
                    ...other,
                    startTime: (date && date[0]) || "",
                    endedTime: (date && date[1]) || "",
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                });
                this.modelList = respData.list || [];
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
                    component: "el-input",
                    label: "模型名称：",
                    prop: "modelTypeName",
                    componentProp: {
                        placeholder: "请输入模型名称",
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
                    label: "模型类型",
                    prop: "modelTypeName",
                    width: 100,
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
                                        src: process.env.VUE_APP_RESOURCE_SERVER + row.modelTypeIcon + "?" + Math.random(),
                                        previewSrcList: [process.env.VUE_APP_RESOURCE_SERVER + row.modelTypeIcon + "?" + Math.random()],
                                        lazy: true,
                                    },
                                }),
                                h("span", row.modelTypeName),
                            ]
                        );
                    },
                },
                { label: "父级类别", prop: "parentId", width: 100, align: "center",
                    render: (f, { row }) => {
                        return f("span", this.treeMap[row.parentId])
                    }
                },
                { label: "创建时间", prop: "createTime", width: 160, align: "center" },
                { label: "备注", prop: "remark", align: "left", width: 160 },
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
                                            this.$router.push("/model/data?type=" + row.id);
                                        },
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
                                        click: () => this.deleteModels([row.id], "是否删除" + row.modelTypeName),
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
