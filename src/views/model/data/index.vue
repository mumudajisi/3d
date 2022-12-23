<template>
    <div class="mode-manage">
        <base-form size="small" :model="form" show-search :components="components" @search="getList" />
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button v-permission="['train3d:add']" type="primary" icon="el-icon-plus" size="mini" @click="showAddDialog">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-permission="['train3d:edit']"
                    type="success"
                    icon="el-icon-edit"
                    size="mini"
                    :disabled="selection.length !== 1"
                    @click="showAddEditDialog('edit', selection[0])"
                >修改
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-permission="['train3d:delete']" type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0"
                    @click="deleteChoseKnows"
                >
                    删除
                </el-button>
            </el-col>
        </el-row>
        <base-table v-loading="loading" :data="modelList" :columns="columns" @selection-change="handleSelectionChange" />
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
        <model-data-manage :visible.sync="addEditVisible" :type="addEditType" :row="row" @success="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue"
import BaseTable from "@/components/BaseTable/BaseTable.vue"
import Treeselect from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"
import { model } from "@/api"
import { dict } from "@/api"
import ModelDataManage from "@/views/model/data/model-data-manage"

export default {
    name: "ModelData",
    components: { ModelDataManage, BaseForm, BaseTable },
    data() {
        return {
            addEditVisible: false,
            addEditType: "add",
            row: null,
            form: {
                modelTitle: "",
                modelTypeId: undefined,
                date: []
            },
            components: [],
            columns: [],
            selection: [],
            modelList: [],
            konwList: [],
            modelTypeTreeList: [],
            loading: false,
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20
            },
            lightList: [],
            styleList: [],
            versionList: []

        }
    },
    watch: {
        $route() {
            if (this.$route.path !== "/model/data") return
            const type = this.$route.query.type
            if (type) {
                this.form.modelTypeId = Number(type)
                this.getList()
            } else {
                this.form.modelTypeId = undefined
            }
        }
    },
    created() {
        const type = this.$route.query.type
        if (type) {
            this.form.modelTypeId = Number(type)
        }
        this.getTypeTree()
        this.getList()
        this.getKey()
        this.initCom()
        this.initColumn()
    },
    methods: {

        // 查找字典中的数据
        async getKey() {
            this.dictMap = (await dict.getDictDataTypes(
                {
                    pageNum: 1,
                    pageSize: 100000000,
                    typeList: ["model_light", "model_style", "model_version"],
                }
            ))
            this.styleList = this.dictMap.respData.model_style;
            this.lightList = this.dictMap.respData.model_light;
            this.versionList = this.dictMap.respData.model_version;
        },
        reset() {
            this.form = {
                modelTitle: "",
                modelTypeId: undefined,
                date: []
            }
            this.getList()
        },
        showAddDialog() {
            const modelTypeId = this.$route.query.type
            const row = modelTypeId ? { modelTypeId: Number(modelTypeId) } : null
            this.showAddEditDialog("add", row)
        },
        showAddEditDialog(type, row) {
            this.addEditVisible = true
            this.addEditType = type
            this.row = row ? Object.assign(row) : row
        },
        deleteKnows(ids, msg, fn) {
            this.$modal.confirm(msg).then(async () => {
                try {
                    await model.deleteModelsData({
                        ids: ids
                    })
                    this.getList()
                    this.$modal.msgSuccess("删除成功")
                    fn?.()
                } catch (error) {
                    console.log(error)
                }
            })
        },
        deleteChoseKnows() {
            const ids = this.selection.map((item) => item.id)
            this.deleteKnows(ids, "是否批量删除选中数据", () => {
                this.selection = []
            })
        },
        async getList() {
            try {
                this.loading = true
                const { date, modelTypeId, ...other } = this.form
                const { respData } = await model.getModelDataList({
                    ...other,
                    modelTypeId: modelTypeId,
                    startTime: (date && date[0]) || "",
                    endedTime: (date && date[1]) || "",
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize
                })
                this.modelList = respData.list || []
                this.paging.total = respData.total || 0
            } catch (error) {
                console.log(error)
            } finally {
                this.loading = false
            }
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value
        },
        changeSwitch(row, key, message) {
            const text = row[key] === 0 ? "启用" : "停用"
            this.$modal
                .confirm('确认要"' + text + '""' + message + '"吗？')
                .then(async () => {
                    try {
                        await model.updateModelData({
                            id: row.id,
                            [key]: row[key] === 0 ? 1 : 0
                        })
                        row[key] = row[key] === 0 ? 1 : 0
                        this.$modal.msgSuccess(text + "成功")
                    } catch (error) {
                        console.log(error)
                    }
                })
                .catch(() => {})
        },

        initCom() {
            this.components = [
                {
                    label: "模型名称：",
                    prop: "modelTitle",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入模型名称"
                    }
                },
                {
                    label: "模型类别：",
                    prop: "modelTypeId",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入模型类别"
                    },
                    render: (h) => {
                        return h(Treeselect, {
                            style: "width: 215px;",
                            props: {
                                value: this.form.modelTypeId,
                                options: this.modelTypeTreeList,
                                normalizer: (node) => {
                                    if (node.children && !node.children.length) {
                                        delete node.children
                                    }
                                    return {
                                        id: node.id,
                                        label: node.name,
                                        children: node.children
                                    }
                                },
                                showCount: true,
                                placeholder: "请选择模型类型"
                            },
                            on: {
                                input: (value) => {
                                    this.form.modelTypeId = value
                                }
                            }
                        })
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
                        valueFormat: "yyyy-MM-dd"
                    }
                }
            ]
        },
        // 模型运行
        modelRun(item) {
            this.$loading({ text: "加载中" })
            const params = {
                ftpId: 1,
                id: item.id,
                modelCode: item.modelLight,
            }
            model.webUnzipModel(params).then(res => {
                if (res.respType === 1) {
                    this.getList()
                    window.open(process.env.VUE_APP_RESOURCE_SERVER + res.respData, "_blank")
                    this.$loading().close()
                }
            }).catch(err => {
                console.log(err)
                this.$loading().close()
            })
        },
        async getTypeTree() {
            try {
                const { respData } = await model.getTypeTree()
                this.modelTypeTreeList = respData || []
            } catch (error) {
                console.log(error)
            }
        },
        initColumn() {
            this.columns = [
                { type: "selection", width: 50, align: "center" },
                {
                    label: "模型名称",
                    prop: "modelTitle",
                    width: 200,
                    render: (h, { row }) => {
                        return h(
                            "div",
                            {
                                class: "flex-align-center"
                            },
                            [
                                h("el-image", {
                                    style: "width: 40px;height: 40px;margin-right: 10px;",
                                    props: {
                                        src: process.env.VUE_APP_RESOURCE_SERVER + row.modelIcon + "?" + Math.random(),
                                        previewSrcList: [process.env.VUE_APP_RESOURCE_SERVER + row.modelIcon + "?" + Math.random()],
                                        lazy: true
                                    }
                                }),
                                h("span", row.modelTitle)
                            ]
                        )
                    }
                },
                { label: "模型编号", prop: "modelLight", width: 200, align: "left" },
                { label: "模型类别", prop: "modelTypeName", width: 100, align: "center" },
                { label: "备注", prop: "remark", width: 100, align: "left", showOverflowTooltip: true },
                {
                    label: "开放关联",
                    prop: "isBinding",
                    width: 120,
                    align: "center",
                    render: (h, { row }) => {
                        return h("el-switch", {
                            props: { value: row.isBinding, activeValue: 1, inactiveValue: 0, disabled: !this.$permission(["train3d:edit"]) },
                            on: {
                                change: () => this.changeSwitch(row, "isBinding", "开放关联"),
                            },
                        });
                    },
                },
                { label: "创建时间", prop: "createTime", width: 160, align: "center" },
                {
                    type: "operate",
                    align: "center",
                    label: "操作",
                    width: 200,
                    render: (h, { row }) => {
                        return h("div", [
                            this.$permission(["train3d:modelRun"]) ? h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-s-promotion" },
                                    on: {
                                        click: () => this.modelRun(row)
                                    }
                                },
                                "运行"
                            ) : null,
                            this.$permission(["train3d:edit"]) ? h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-edit" },
                                    on: {
                                        click: () => this.showAddEditDialog("edit", row)
                                    }
                                },
                                "修改"
                            ) : null,
                            this.$permission(["train3d:delete"]) ? h(
                                "el-button",
                                {
                                    props: { size: "mini", type: "text", icon: "el-icon-delete" },
                                    on: {
                                        click: () => this.deleteKnows([row.id], "是否删除" + row.modelTitle)
                                    }
                                },
                                "删除"
                            ) : null,
                        ])
                    }
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped></style>
