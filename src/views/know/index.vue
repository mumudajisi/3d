<template>
    <div class="entry-manage">
        <base-form size="small" :model="form" show-search :components="components" @search="getList" />
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button v-permission="['know:add']" type="primary" icon="el-icon-plus" size="mini" @click="showAddDialog('add',null)">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-permission="['know:edit']"
                    type="success"
                    icon="el-icon-edit"
                    size="mini"
                    :disabled="selection.length !== 1"
                    @click="showAddEditDialog('edit', selection[0])"
                >修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button v-permission="['know:delete']" type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseKnows">
                    删除
                </el-button>
            </el-col>
        </el-row>
        <base-table v-loading="loading" :data="knowList" :columns="columns" @selection-change="handleSelectionChange" />
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
        <know-data-manage v-if="addEditVisible" :visible.sync="addEditVisible" :type="addEditType" :row="row" @success="getList" />
        <el-dialog
            :visible="look"
            append-to-body
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :title="lookMessageTitle"
            destroy-on-close
            width="800px"
            @close="look = false"
        >
            <div v-html="lookMessageContent" />

            <span slot="footer">
                <el-button @click=" look =false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { know } from "@/api";
import KnowDataManage from "@/views/know/know-data-manage";

export default {
    name: "Know",
    components: { KnowDataManage, BaseForm, BaseTable },
    data() {
        return {
            look: false,
            addEditVisible: false,
            addEditType: "add",
            row: null,
            form: {
                knowTitle: "",
                knowTypeId: null,
                date: [],
            },
            lookMessageContent: "",
            lookMessageTitle: "",
            components: [],
            columns: [],
            selection: [],
            knowTypeTreeList: [],
            knowList: [],
            loading: false,
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
        };
    },
    watch: {
        $route() {
            if (this.$route.path !== "/know/data") return
            const type = this.$route.query.type;
            if (type) {
                this.form.knowTypeId = Number(type);
                this.getList();
            } else {
                this.form.knowTypeId = null;
            }
        },
    },
    created() {
        const type = this.$route.query.type;
        if (type) {
            this.form.knowTypeId = Number(type);
        }
        this.initCom();
        this.getTypeTree();
        this.getList();
        this.initColumn();
    },
    methods: {
        reset() {
            this.form = {
                knowTitle: "",
                knowTypeId: null,
                date: [],
            };
            this.getList()
        },
        lookMessage(row) {
            this.look = true;
            this.lookMessageContent = row.knowContent;
            this.lookMessageTitle = row.knowTitle;
        },
        showAddDialog() {
            const knowTypeId = this.$route.query.type;
            const row = knowTypeId ? { knowTypeId: Number(knowTypeId) } : null;
            this.showAddEditDialog("add", row);
        },
        showAddEditDialog(type, row) {
            this.addEditVisible = true;
            this.addEditType = type;
            this.row = row ? Object.assign({}, row) : row;
        },
        deleteKnows(ids, msg, fn) {
            this.$modal.confirm(msg).then(async () => {
                try {
                    await know.deleteKnowsData({
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
        deleteChoseKnows() {
            const ids = this.selection.map((item) => item.id);
            this.deleteKnows(ids, "是否批量删除选中数据", () => {
                this.selection = [];
            });
        },
        async getList() {
            try {
                this.loading = true;
                const { date, ...other } = this.form;
                const { respData } = await know.getKnowDataList({
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
        changeSwitch(row, key, message) {
            const text = row[key] === 0 ? "启用" : "停用";
            this.$modal
                .confirm('确认要"' + text + '""' + message + '"吗？')
                .then(async () => {
                    try {
                        await know.updateKnowData({
                            id: row.id,
                            [key]: row[key] === 0 ? 1 : 0,
                        });
                        row[key] = row[key] === 0 ? 1 : 0;
                        this.$modal.msgSuccess(text + "成功");
                    } catch (error) {
                        console.log(error);
                    }
                })
                .catch(() => {});
        },
        async getTypeTree() {
            try {
                const { respData } = await know.getTypeTree();
                this.knowTypeTreeList = respData || [];
            } catch (error) {
                console.log(error);
            }
        },
        initCom() {
            this.components = [
                {
                    label: "词条标题：",
                    prop: "knowTitle",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入词条标题",
                    },
                },
                {
                    label: "词条类型：",
                    prop: "knowTypeId",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入词条类型",
                    },
                    render: (h) => {
                        return h(Treeselect, {
                            style: "width: 215px;",
                            props: {
                                value: this.form.knowTypeId,
                                options: this.knowTypeTreeList,
                                normalizer: (node) => {
                                    if (node.children && !node.children.length) {
                                        delete node.children;
                                    }
                                    return {
                                        id: node.id,
                                        label: node.name,
                                        children: node.children,
                                    };
                                },
                                showCount: true,
                                placeholder: "请选择词条类型"
                            },
                            on: {
                                input: (value) => {
                                    this.form.knowTypeId = value;
                                }
                            }
                        },)
                    }
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
                    label: "词条标题",
                    prop: "knowTitle",
                    width: 150,
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
                                        src: process.env.VUE_APP_RESOURCE_SERVER + row.knowIcon + "?" + Math.random(),
                                        previewSrcList: [process.env.VUE_APP_RESOURCE_SERVER + row.knowIcon + "?" + Math.random()],
                                        lazy: true,
                                    },
                                }),
                                h("span", row.knowTitle),
                            ]
                        );
                    },
                },
                { label: "词条类型", prop: "knowTypeName", width: 100, align: "center", },
                {
                    label: "开放关联",
                    prop: "isBinding",
                    width: 100,
                    align: "center",
                    render: (h, { row }) => {
                        return h("el-switch", {
                            props: { value: row.isBinding, activeValue: 1, inactiveValue: 0, disabled: !this.$permission(["know:edit"]) },
                            on: {
                                change: () => this.changeSwitch(row, "isBinding", "开放关联"),
                            },
                        });
                    },
                },
                { label: "名词解释", width: 400, align: "left", prop: "remark",
                    render: (h, { row }) => {
                        return h("el-popover", {
                            "popper-class": "custom-hover",
                            props: {
                                content: row.remark,
                                trigger: "hover",
                            },
                        }, [
                            h("div", {
                                slot: "reference",
                                class: "overflow-ellipse"
                            },
                            row.remark)
                        ]);
                    }
                },
                { label: "创建时间", prop: "createTime", align: "center", width: 170 },
                {
                    type: "operate",
                    align: "center",
                    label: "操作",
                    width: 160,
                    render: (h, { row }) => {
                        return h("div", [
                            this.$permission(["know:edit"]) ? h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-view" },
                                    on: {
                                        click: () => this.lookMessage(row),
                                    },
                                },
                                "详情"
                            ) : null,
                            this.$permission(["know:edit"]) ? h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-edit" },
                                    on: {
                                        click: () => this.showAddEditDialog("edit", row),
                                    },
                                },
                                "修改"
                            ) : null,
                            this.$permission(["know:delete"]) ? h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-delete" },
                                    on: {
                                        click: () => this.deleteKnows([row.id], "是否删除" + row.knowTitle),
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

<style lang="scss">
.overflow-ellipse {
    word-break: break-all;
    text-overflow: ellipsis;//超出省略
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 这里是超出几行省略 */
    overflow: hidden;
}
.el-popover.el-popper.el-popover--plain {
    max-width: 600px;
}
</style>
