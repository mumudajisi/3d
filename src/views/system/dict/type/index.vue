<template>
    <div class="dict-data">
        <base-form size="small" :model="form" show-search :components="components" @search="getList" />
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" icon="el-icon-plus" size="mini" @click="showAddEditDialog('add', { dictCode: $route.params.dictCode })">
                    新增
                </el-button>
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
            <el-col :span="1.5">
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="closeThis"> 关闭 </el-button>
            </el-col>
        </el-row>
        <base-table v-loading="loading" :data="dictList" :columns="columns" @selection-change="handleSelectionChange" />
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
        <dict-type-manage :visible.sync="addEditVisible" :type="addEditType" :row="addEditRow" @success="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { mapGetters } from "vuex";
import { dict } from "@/api";
import DictTypeManage from "@/views/system/dict/type/dict-type-manage";

export default {
    name: "DictType",
    components: { DictTypeManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            addEditRow: null,
            loading: false,
            form: {
                dictLabel: "",
                status: "",
            },
            components: [],
            selection: [],
            dictList: [],
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
        };
    },
    computed: {
        ...mapGetters("userx", ["tagViews"]),
    },
    watch: {
        "$route.fullPath"() {
            this.getList();
        },
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
        deleteChoseDicts() {
            const ids = this.selection.map((item) => item.id);
            this.deleteDicts(ids, () => {
                this.selection = [];
            });
        },
        deleteDicts(ids, fn) {
            this.$modal.confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除字典编号为" + ids) + "的数据项").then(async () => {
                try {
                    await dict.deleteDictData({
                        ids: ids,
                    });
                    await this.getList();
                    this.$modal.msgSuccess("删除成功");
                    fn?.();
                } catch (error) {
                    console.log(error);
                }
            });
        },
        closeThis() {
            const index = this.tagViews.findIndex((t) => t.path === this.$route.fullPath);
            if (index !== -1) {
                this.$store.commit("userx/SET_TAGVIEWS", [...this.tagViews.slice(0, index), ...this.tagViews.slice(index + 1)]);
            }
            this.$router.push("/system/dict-data");
        },
        async getList() {
            try {
                const { respData } = await dict.getDictDataList({
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                    dictCode: this.$route.params.dictCode,
                    ...this.form,
                });
                this.dictList = respData.list || [];
                this.paging.total = respData.total || 0;
            } catch (error) {
                console.log(error);
            }
        },
        initCom() {
            this.components = [
                {
                    label: "字典标签：",
                    prop: "dictLabel",
                    component: "el-input",
                    componentProp: {
                        width: "200px",
                        placeholder: "请输入字典标签",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        width: "200px",
                        placeholder: "数据状态",
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
                { label: "字典类型", prop: "dictCode", width: 120, align: "center" },
                { label: "字典键值", prop: "dictValue", width: 180, align: "center" },
                { label: "字典标签", prop: "dictLabel", width: 180 },
                { label: "排序", prop: "dictSort", width: 180, align: "center" },
                { label: "是否默认", prop: "isDefault", width: 100, align: "center" },
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
                { label: "备注", prop: "remark" },
                { label: "创建时间", prop: "createTime", width: 200, align: "center" },
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
