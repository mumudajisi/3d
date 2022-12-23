<template>
    <div class="line-manage">
        <el-row :gutter="20">
            <el-col :span="4" :xs="24">
                <div class="head-container">
                    <el-input
                        v-model="nodeName"
                        placeholder="请输入节点名称"
                        clearable
                        size="small"
                        prefix-icon="el-icon-search"
                        style="margin-bottom: 20px"
                    />
                </div>
                <div class="head-container">
                    <el-tree
                        ref="tree"
                        :data="nodeTreeList"
                        :props="defaultProps"
                        :expand-on-click-node="false"
                        :filter-node-method="filterNode"
                        node-key="id"
                        highlight-current
                        accordion
                        @node-click="handleNodeClick"
                    />
                </div>
            </el-col>
            <el-col :span="20" :xs="24">
                <base-form size="small" :model="form" show-search :components="components" :hidden-num="4" @search="getList" />
                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button v-permission="['line:add']" type="primary" icon="el-icon-plus" size="mini" @click="showAddEditDialog('add', null)">新增</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button
                            v-permission="['line:edit']"
                            type="success"
                            icon="el-icon-edit"
                            size="mini"
                            :disabled="selection.length !== 1"
                            @click="showAddEditDialog('edit', selection[0])"
                        >修改</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button v-permission="['line:delete']" type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteChoseLines">
                            删除
                        </el-button>
                    </el-col>
                </el-row>
                <basic-table v-loading="loading" :data="lineList" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" align="center" />
                    <el-table-column v-if="false" label="id" prop="id" />
                    <el-table-column label="线路名称" prop="lineName" width="100">
                        <template #default="{ row }">
                            <div class="flex-align-center">
                                <span>{{ row.lineName }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="工程编号" prop="projectCode" width="100" align="center" />
                    <el-table-column label="上级节点" prop="belongNodeName" width="100" align="center" />
                    <el-table-column label="线路级别" prop="lineLevel" width="100" align="center">
                        <template #default="{ row }">
                            <span>{{ getDiplayLevel(row) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="线路节点1" prop="lineNodeName1" width="100" align="center" />
                    <el-table-column label="线路节点2" prop="lineNodeName2" width="100" align="center" />
                    <el-table-column label="关联词条" prop="linkKnowName" width="100" align="center" :hidden="true" />
                    <el-table-column label="关联模型" prop="linkModelName" width="100" align="center" :hidden="true" />
                    <el-table-column label="电流方向" prop="lineDir" width="100" align="center">
                        <template #default="{ row }">
                            <span>{{ getLineDir(row) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="false" label="线路电流" prop="lineCur" width="100" align="center" />
                    <el-table-column label="额定电压" prop="volLevel" width="100" align="center">
                        <template #default="{ row }">
                            <span>{{ getVolLevel(row) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="分流比例(%)" prop="scale" width="100" align="center" />
                    <el-table-column label="链接地图" prop="belongMap" width="100" align="center">
                        <template #default="{ row }">
                            <span>{{ getBelongMap(row) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="链接节点" prop="remark" width="100" align="center">
                        <template #default="{ row }">
                            <span>{{ getRemark(row) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" prop="status" width="100" align="center">
                        <template #default="{ row }">
                            <el-switch :value="row.status" :active-value="1" :inactive-value="0" @change="onSwitchChange(row)" />
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
                    <el-table-column type="operate" label="操作" align="center" width="180" fixed="right">
                        <template #default="{ row }">
                            <el-button v-permission="['line:edit']" type="text" size="mini" icon="el-icon-edit" @click="showAddEditDialog('edit', row)">修改</el-button>
                            <el-button v-permission="['line:delete']" type="text" size="mini" icon="el-icon-delete" @click="deleteLines([row.id], '是否删除' + row.lineName)">删除</el-button>
                        </template>
                    </el-table-column>
                </basic-table>
                <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
                <LineDataManage :visible.sync="visible" :type="addEditType" :row="row" @success="getList" />
            </el-col></el-row></div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BasicTable from "@/components/BaseTable/BasicTable.vue";
import LineDataManage from "@/views/simu/line/line-data-manage";
import { simulation } from "@/api";
import { dict } from "@/api";

export default {
    name: "LineManage",
    components: { BaseForm, BasicTable, LineDataManage },
    data() {
        return {
            visible: false,
            addEditType: "add",
            row: null,
            nodeName: "",
            nodeTreeList: [],
            defaultProps: { children: "children", label: "name" },
            form: {
                id: "",
                lineName: "",
                lineCode: "",
                busiCode: "",
                remark: "",
                projectCode: "",
                volLever: "",
                belongNode: "",
                lineLevel: "",
                scale: "",
                linkNode: "",
                belongMap: "",
                elecType: "",
                node1IsHead: "",
                diplayLevel: "",
                lineDir: "",
                tranCode: "",
                status: "",
                lineLever: "",
                lineNode1: "",
                lineNode2: "",
                volLevel: "",
                date: []
            },
            components: [],
            lineList: [],
            loading: false,
            chooseNode: null,
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20
            },
            selection: [],
            lineDir: [],
            elecType: [],
            diplayLevel: [],
            volLevel: [],
            nodeList: [],
            remark: [],
            knowList: [],
            belongMap: [],
            chooseLineLevel: -1,
        }
    },
    computed: {
        getLineDir() {
            return (row) => {
                const res = this.lineDir.find(e => parseInt(e.dictValue) === parseInt(row.lineDir));
                return res ? res.dictLabel : "";
            }
        },
        getDiplayLevel() {
            return (row) => {
                const res = this.diplayLevel.find(e => parseInt(e.dictValue) === parseInt(row.lineLevel));
                return res ? res.dictLabel : "";
            }
        },
        getVolLevel() {
            return (row) => {
                const res = this.volLevel.find(e => e.dictValue === row.volLevel);
                return res ? res.dictLabel : "";
            }
        },
        getRemark() {
            return (row) => {
                const res = this.remark.find(e => parseInt(e.dictValue) === parseInt(row.remark));
                return res ? res.dictLabel : "";
            }
        },
        getBelongMap() {
            return (row) => {
                const res = this.belongMap.find(e => parseInt(e.dictValue) === parseInt(row.belongMap));
                return res ? res.dictLabel : "";
            }
        },
    },
    watch: {
        nodeName(val) {
            this.$refs.tree.filter(val)
        }
    },
    created() {
        (async () => {
            await this.getNodeList();
            this.initCom();
            this.getList();
            this.getNodeTree();
            this.getTypes();
        })();
    },
    methods: {
        async getTypes() {
            this.dictMap = (await dict.getDictDataTypes(
                {
                    pageNum: 1,
                    pageSize: 100000000,
                    typeList: ["line_dir", "diplay_level", "vol_level", "click_node", "belong_map"],
                }
            ))
            this.lineDir = this.dictMap.respData.line_dir;
            this.diplayLevel = this.dictMap.respData.diplay_level;
            this.volLevel = this.dictMap.respData.vol_level;
            this.remark = this.dictMap.respData.click_node;
            this.belongMap = this.dictMap.respData.belong_map;
        },
        findLevel(tree, id, level = 1) {
            for (let i = 0; i < tree.length; i++) {
                if (tree[i].id === id) {
                    this.chooseLineLevel = level;
                    return;
                }
                if (tree[i].children && tree[i].children.length > 0) {
                    this.findLevel(tree[i].children, id, level + 1);
                }
            }
        },
        async getNodeList() {
            this.nodeList = (await simulation.getNodeList({
                pageNum: 1,
                pageSize: 100000000,
            })).respData?.list;
        },
        // 删选节点
        filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        handleNodeClick(data) {
            this.chooseNode = Object.assign({}, { ...data });
            this.form.belongNode = data.id;
            this.getList();
            this.findLevel(this.nodeTreeList, data.id);
        },
        reset() {
            this.form.belongNode = "";
            const select = this.$refs["tree"].$el.querySelector(".is-current");
            this.chooseNode = null;
            if (select) {
                select.classList.remove("is-current");
            }
            this.getList()
        },
        onSwitchChange(row) {
            const { id, lineName, status } = row;
            const text = status === 0 ? "启用" : "停用";
            const newState = status === 0 ? 1 : 0;
            this.$modal.confirm('确认要"' + text + '""' + lineName + '"路线吗？').then(async () => {
                try {
                    await simulation.updateLine({
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
            if (this.diplayLevel.length < (this.chooseLineLevel + 1)) {
                this.visible = false;
                this.$alert("请前往字典表增加线路级别和对应的颜色", "警告", {
                    confirmButtonText: "确定",
                    type: "warning"
                });
            } else {
                this.visible = true;
                this.addEditType = type;
                this.row = row ? Object.assign(row) : this.chooseNode ? { belongNode: this.chooseNode.id } : row;
            }
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        async getNodeTree() {
            try {
                const { respData } = await simulation.getNodeTree();
                this.nodeTreeList = respData || [];
            } catch (error) {
                console.log(error)
            }
        },
        async getList() {
            try {
                this.loading = true;
                const { date, ...other } = this.form;
                const { respData } = await simulation.getLineList({
                    ...other,
                    startTime: (date && date[0]) || "",
                    endedTime: (date && date[1]) || "",
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                });
                this.lineList = respData.list || [];
                this.paging.total = respData.total || 0;
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        deleteLines(ids, msg, fn) {
            this.$modal.confirm(msg).then(async () => {
                try {
                    await simulation.deleteLines({
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
        deleteChoseLines() {
            const ids = this.selection.map((item) => item.id);
            this.deleteLines(ids, "是否批量删除选中数据", () => {
                this.selection = [];
            });
        },
        initCom() {
            this.components = [
                {
                    label: "线路名称：",
                    prop: "lineName",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入线路名称"
                    }
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
                    label: "上级节点：",
                    prop: "belongNode",
                    component: "el-select",
                    componentProp: {
                        placeholder: "请选择上级节点",
                        filterable: true,
                    },
                    selectOption: this.nodeList.map(item => ({
                        "label": item.nodeName,
                        "value": item.id
                    }))
                },
                {
                    component: "BaseSelect",
                    label: "线路级别：",
                    prop: "lineLevel",
                    componentProp: {
                        placeholder: "请选择线路级别",
                        type: "diplay_level",
                    }
                },
                {
                    label: "链接地图：",
                    prop: "belongMap",
                    component: "BaseSelect",
                    componentProp: {
                        placeholder: "请输入链接地图",
                        type: "belong_map",
                        filterable: true,
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
    }
}
</script>

<style lang="scss" scoped></style>
