<template>
    <div class="post-manage">
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
                <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChosePosts">
                    删除
                </el-button>
            </el-col>
            <!-- <el-col :span="1.5">
                <el-button type="warning" icon="el-icon-download" size="mini">导出</el-button>
            </el-col> -->
        </el-row>
        <base-table v-loading="loading" :data="deptList" :columns="columns" @selection-change="handleSelectionChange" />
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
        <post-manage :visible.sync="addEditVisible" :type="addEditType" :row="addEditRow" @success="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { post } from "@/api";
import PostManage from "@/views/user/post/post-manage";

export default {
    name: "PostIndex",
    components: { PostManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            addEditRow: null,
            data: [],
            form: {
                postCode: "",
                postName: "",
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
        showAddEditDialog(type, row) {
            this.addEditVisible = true;
            this.addEditType = type;
            this.addEditRow = row ? Object.assign(row) : row;
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        async getList() {
            try {
                this.loading = true;
                const { respData } = await post.getPostList({
                    ...this.form,
                    status: this.form.status !== "" ? this.form.status : null,
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                });
                this.deptList = respData.list || [];
                this.paging.total = respData.total || 0;
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        deletePosts(ids, fn) {
            this.$modal.confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除岗位编号为" + ids) + "的数据项").then(async () => {
                try {
                    await post.deletePosts({
                        postIds: ids,
                    });
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                    fn?.();
                } catch (error) {
                    console.log(error);
                }
            });
        },
        deleteChosePosts() {
            const ids = this.selection.map((item) => item.postId);
            this.deletePosts(ids, () => {
                this.selection = [];
            });
        },
        initCom() {
            this.components = [
                {
                    label: "岗位编码：",
                    prop: "postCode",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入岗位编码",
                    },
                },
                {
                    label: "岗位名称：",
                    prop: "postName",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入岗位名称",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        placeholder: "岗位状态",
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
                // { label: "岗位编号", prop: "postId", width: 220, align: "center" },
                { label: "岗位编码", prop: "postCode", width: 220, align: "center" },
                { label: "岗位名称", prop: "postName", width: 220, align: "center" },
                { label: "岗位排序", prop: "sortNo", width: 220, align: "center" },
                {
                    label: "状态",
                    prop: "status",
                    width: 220,
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
                { label: "创建时间", prop: "createTime", width: 180, align: "center" },
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
                                        click: () => this.deletePosts([row.postId]),
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
