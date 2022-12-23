<template>
    <div class="node-manage">
        <base-form size="small" :model="form" show-search :components="components" :hidden-num="4" @search="getList" />
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button v-permission="['node:add']" type="primary" icon="el-icon-plus" size="mini" @click="showAddEditDialog('add', null)">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-permission="['node:edit']"
                    type="success"
                    icon="el-icon-edit"
                    size="mini"
                    :disabled="selection.length !== 1"
                    @click="showAddEditDialog('edit', selection[0])"
                >修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button v-permission="['node:delete']" type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseNodes">
                    删除
                </el-button>
            </el-col>
        </el-row>
        <basic-table v-loading="loading" :data="nodeList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" align="center" />
            <el-table-column v-if="false" label="id" prop="id" />
            <el-table-column label="节点名称" prop="nodeName" width="100">
                <template #default="{ row }">
                    <div class="flex-align-center">
                        <el-image v-if="false" :src="row.nodeImage" :preview-src-list="[row.nodeImage]" lazy style="width: 40px; height: 40px; margin-right: 10px" />
                        <span>{{ row.nodeName }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="工程编号" prop="projectCode" width="100" />
            <el-table-column label="节点类型" prop="nodeType" width="100">
                <template #default="{ row }">
                    <span>{{ getNodeType(row) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="上级节点" prop="parentIdName" width="100" />
            <el-table-column label="节点电压" prop="nodeVol" width="100">
                <template #default="{ row }">
                    <span>{{ getVolLevel(row) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="发电功率(MW)" width="100">
                <template slot-scope="scope">
                    <!--判断有没有考试这个字段-->
                    {{ scope.row.nodePower !==0 ? scope.row.nodePower : "--" }}
                </template>
            </el-table-column>
            <el-table-column v-if="false" label="节点编号" prop="nodeCode" width="100" />
            <el-table-column label="关联词条" prop="knowPointName" width="100" />
            <el-table-column label="关联模型" prop="linkModelName" width="100" />
            <el-table-column label="经度" prop="longitude" width="100" />
            <el-table-column label="纬度" prop="latitude" width="100" />
            <el-table-column label="状态" prop="status" width="100" align="center">
                <template #default="{ row }">
                    <el-switch :value="row.status" :active-value="1" :inactive-value="0" @change="onSwitchChange(row)" />
                </template>
            </el-table-column>
            <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
            <el-table-column type="operate" label="操作" align="center" width="180">
                <template #default="{ row }">
                    <el-button v-permission="['node:edit']" type="text" size="mini" icon="el-icon-edit" @click="showAddEditDialog('edit', row)">修改</el-button>
                    <el-button v-permission="['node:delete']" type="text" size="mini" icon="el-icon-delete" @click="deleteNodes([row.id], '是否删除' + row.nodeName)">删除</el-button>
                </template>
            </el-table-column>
        </basic-table>
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
        <node-manage :visible.sync="visible" :type="addEditType" :row="row" @success="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BasicTable from "@/components/BaseTable/BasicTable.vue";
import { simulation } from "@/api";
import { dict } from "@/api";
import NodeManage from "@/views/simu/node/node-manage";

export default {
    name: "NodeIndex",
    components: { NodeManage, BaseForm, BasicTable, },
    data() {
        return {
            visible: false,
            addEditType: "add",
            row: null,
            form: {
                id: "",
                nodeName: "",
                nodeType: "",
                status: "",
                nodeLine: "",
                nodeAddr: "",
                nodeBelong: "",
                nodeVol: "",
                knowPoint: "",
                longitude: "",
                nodeCode: "",
                latitude: "",
                nodeImage: "",
                nodeLevel: "",
                nodePower: "",
                projectCode: "",
                date: [],
            },
            nodeList: [],
            components: [],
            loading: false,
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
            selection: [],
            nodeType: [],
            volLevel: [],
            parentList: [],
        }
    },
    computed: {
        getNodeType() {
            return (row) => {
                const res = this.nodeType.find(e => parseInt(e.dictValue) === parseInt(row.nodeType));
                return res ? res.dictLabel : "";
            }
        },
        getVolLevel() {
            return (row) => {
                const res = this.volLevel.find(e => e.dictValue === row.nodeVol);
                return res ? res.dictLabel : "";
            }
        },
    },
    created() {
        (async () => {
            await this.getNodeList();
            this.initCom();
            this.getList();
            this.getKey();
        })();
    },
    methods: {
        // 查找字典中的数据
        async getKey() {
            this.dictMap = (await dict.getDictDataTypes(
                {
                    pageNum: 1,
                    pageSize: 100000000,
                    typeList: ["node_type", "vol_level"],
                }
            ))
            this.nodeType = this.dictMap.respData.node_type;
            this.volLevel = this.dictMap.respData.vol_level;
        },
        on() {
        },
        async getNodeList() {
            this.parentList = (await simulation.getNodeList({
                pageNum: 1,
                pageSize: 100000000,
            })).respData?.list;
        },
        onSwitchChange(row) {
            const { id, nodeName, status } = row;
            const text = status === 0 ? "启用" : "停用";
            const newState = status === 0 ? 1 : 0;
            this.$modal.confirm('确认要"' + text + '""' + nodeName + '"节点吗？').then(async () => {
                try {
                    await simulation.updateNode({
                        id: id,
                        status: newState,
                    });
                    row.status = newState;
                    this.$modal.msgSuccess(text + "成功");
                } catch (error) {
                    console.log(error);
                }
            });
        },
        showAddEditDialog(type, row) {
            this.visible = true;
            this.addEditType = type;
            this.row = row ? Object.assign(row) : row;
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        async getList() {
            try {
                this.loading = true;
                const { date, ...other } = this.form;
                const { respData } = await simulation.getNodeList({
                    ...other,
                    startTime: (date && date[0]) || "",
                    endedTime: (date && date[1]) || "",
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                });
                this.nodeList = respData.list || [];
                this.paging.total = respData.total || 0;
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        deleteNodes(ids, msg, fn) {
            this.$modal.confirm(msg).then(async () => {
                try {
                    await simulation.deleteNodes({
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
        deleteChoseNodes() {
            const ids = this.selection.map((item) => item.id);
            this.deleteNodes(ids, "是否批量删除选中数据", () => {
                this.selection = [];
            });
        },
        initCom() {
            this.components = [
                {
                    label: "节点名称：",
                    prop: "nodeName",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入节点名称",
                    },
                },
                {
                    label: "工程编号：",
                    prop: "projectCode",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入工程编号",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "节点类型：",
                    prop: "nodeType",
                    componentProp: {
                        placeholder: "请选择节点类型",
                        type: "node_type"
                    },
                },
                {
                    label: "上级节点：",
                    prop: "parentId",
                    component: "el-select",
                    componentProp: {
                        placeholder: "请选择上级节点",
                        filterable: true,
                    },
                    selectOption: this.parentList.map(item => ({
                        "label": item.nodeName,
                        "value": item.id
                    }))
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
            ];
        },

    },
};
</script>

<style lang="scss" scoped></style>
