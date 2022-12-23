<template>
    <el-dialog v-dialogDrag v-bind="$attrs" :title="`${titleText}线路`" width="800px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="105px">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="线路名称" prop="lineName">
                        <el-input v-model="form.lineName" placeholder="请输入线路名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="上级节点" prop="belongNode">
                        <treeselect
                            v-model="form.belongNode"
                            :options="nodeTreeList"
                            :normalizer="normalizer"
                            :show-count="true"
                            placeholder="请选择上级节点"
                        />
                    </el-form-item></el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="线路节点1" prop="lineNode1">
                        <el-select v-model="form.lineNode1" filterable placeholder="请选择线路节点1" style="width: 100%">
                            <el-option
                                v-for="item in nodeList"
                                :key="item.id"
                                :label="item.nodeName"
                                :value="item.id"
                                :disabled="item.id===form.lineNode2"
                            />
                        </el-select></el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="线路节点2" prop="lineNode2">
                        <el-select v-model="form.lineNode2" filterable placeholder="请选择线路节点2" style="width: 100%">
                            <el-option
                                v-for="item in nodeList"
                                :key="item.id"
                                :label="item.nodeName"
                                :value="item.id"
                                :disabled="item.id===form.lineNode1"
                            />
                        </el-select></el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="额定电压" prop="volLevel">
                        <BaseSelect v-model="form.volLevel" style="width: 100%" type="vol_level" placeholder="请选择额定电压" @finished="getVolLevelLIst" @onchange="volchange()" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="电流方向" prop="lineDir">
                        <BaseSelect v-model="form.lineDir" style="width: 100%" type="line_dir" placeholder="请选择电流方向" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="分流比例(%)" prop="scale">
                        <el-input v-model="form.scale" placeholder="请输入分流比例" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="工程编号" prop="projectCode">
                        <el-input v-model="form.projectCode" placeholder="请输入工程编号" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="线路级别" prop="lineLevel">
                        <BaseSelect v-model="form.lineLevel" style="width: 100%" type="diplay_level" placeholder="一级/二级/三级" disabled />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="线路颜色" prop="lineColor">
                        <BaseSelect v-model="form.lineColor" placeholder="线路颜色" style="width: 100%" type="line_color" disabled />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="关联词条" prop="linkKnow">
                        <el-select v-model="form.linkKnow" filterable style="width: 100%;" placeholder="请选择关联词条信息">
                            <template v-for="(item, i) in dictList">
                                <el-option :key="i" :label="item.knowTitle" :value="item.id" />
                            </template>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="关联模型" prop="linkModel">
                        <el-select v-model="form.linkModel" filterable style="width: 100%;" placeholder="请选择关联模型信息">
                            <el-option
                                v-for="item in modelList"
                                :key="item.id"
                                :label="item.modelTitle"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="链接节点" prop="remark">
                        <BaseSelect v-model="form.remark" style="width: 100%" type="click_node" placeholder="请选择链接节点" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="链接地图" prop="belongMap">
                        <BaseSelect v-model="form.belongMap" filterable style="width: 100%" type="belong_map" placeholder="请选择链接地图" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="状态" prop="status">
                        <el-radio-group v-model="form.status">
                            <el-radio :label="1">正常</el-radio>
                            <el-radio :label="0">停用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { simulation } from "@/api";
import { getAttrsByKeys } from "@/utils";
import BaseSelect from "@/components/BaseSelect/BaseSelect.vue";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { model } from "@/api"
import { dict } from "@/api";

export default {
    name: "AddEditDialog",
    components: { BaseSelect, Treeselect },
    props: {
        type: {
            type: String,
            default: "add",
        },
        row: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            loading: false,
            levelColorMap: [],
            form: {
                id: "",
                lineName: "",
                lineCode: "",
                busiCode: "",
                volLever: "",
                lineColor: "",
                remark: "",
                linkModel: "",
                linkKnow: "",
                elecType: "",
                projectCode: "",
                belongNode: 0,
                belongMap: "",
                lineImp: "",
                lineDir: "",
                volLevel: "",
                lineLevel: "1",
                lineCur: "",
                icon: "",
                lineVol: "",
                tranCode: "",
                lineLever: "",
                lineNode1: "",
                status: 1,
                lineNode2: "",
                node1IsHead: "",
                scale: "",
            },
            nodeTreeList: [],
            nodeList: [],
            knowList: [],
            dictList: [],
            modelList: [],
            lineColorList: [],
            volLevelList: [],
            rules: {
                lineName: [{ required: true, message: "线路名称不能为空", trigger: "blur" }],
                belongNode: [{ required: true, message: "上级节点不能为空", trigger: "blur" }],
                lineNode1: [{ required: true, message: "线路节点1不能为空", trigger: "blur" }],
                lineNode2: [{ required: true, message: "线路节点2不能为空", trigger: "blur" }],
                volLevel: [{ required: true, message: "额定电压不能为空", trigger: "blur" }],
                linkModel: [{ required: true, message: "关联模型不能为空", trigger: "blur" }],
                projectCode: [{ required: true, message: "工程编号不能为空", trigger: "blur" }],
                linkKnow: [{ required: true, message: "关联词条不能为空", trigger: "blur" }],
                belongMap: [{ required: true, message: "链接地图不能为空", trigger: "blur" }],
                remark: [{ required: true, message: "链接节点不能为空", trigger: "blur" }],
                scale: [{ pattern: /^(([0-9]{1}|[1-9]{1}[0-9]{1}|100)|(0{1}))(\.\d*)?$/, required: true, message: "分流比例不能为空且不能超过100%", trigger: "blur" }],
            },
            chooseLineLevel: -1,
        };
    },
    computed: {
        titleText() {
            return {
                add: "添加",
                edit: "修改",
            }[this.type];
        },
    },
    // 监听特定表单数据
    watch: {
        "form.belongNode": {
            handler(newVal) {
                this.chooseLineLevel = -1;
                this.findLevel(this.nodeTreeList, newVal, 0);
                this.form.lineLevel = String(this.chooseLineLevel + 1);
            },
            immediate: true,
        },
        "form.lineLevel": {
            handler(lineLevel) {
                this.levelColorMap = this.lineColorList.map(e => e.dictValue)
                this.form.lineColor = this.levelColorMap[lineLevel - 1];
            },
            immediate: true,
        },
    },
    methods: {
        getVolLevelLIst(data) {
            this.volLevelList = data
        },
        // 遍历层级
        findLevel(tree, id, level = 0) {
            for (let i = 0; i < tree.length; i++) {
                if (this.chooseLineLevel !== -1) {
                    return;
                }
                if (tree[i].id === id) {
                    this.chooseLineLevel = level;
                    return;
                }
                if (tree[i].children && tree[i].children.length > 0) {
                    this.findLevel(tree[i].children, id, level + 1);
                }
            }
        },
        /** 转换菜单数据结构 */
        normalizer(nodes) {
            if (nodes.children && !nodes.children.length) {
                delete nodes.children;
            }
            return {
                id: nodes.id,
                label: nodes.name,
                children: nodes.children,
            };
        },
        async getModelList() {
            this.modelList = (await model.getModelDataList({
                pageNum: 1,
                pageSize: 100000000,
            })).respData.list;
        },
        async getKey() {
            this.lineColorList = (await dict.getDictDataList({
                pageNum: 1,
                pageSize: 100000000,
                dictCode: "line_color",
            })).respData.list;
        },
        async getNodeTree() {
            try {
                const { respData } = await simulation.getNodeTree();
                this.nodeTreeList = [{ id: 0, name: "中国", children: respData || [] }];
            } catch (error) {
                console.log(error);
            }
        },
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                console.log(valid);
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, ...otherForm } = getAttrsByKeys(
                            this.form,
                            "id,lineName,scale,lineCode,projectCode,linkModel,status,busiCode,linkKnow,lineLevel,icon,volLevel,belongNode,remark,volLever,elecType,lineVol,lineImp,lineDir,belongMap,lineCur,lineColor,tranCode,lineLever,lineNode1,lineNode2,node1IsHead"
                        );
                        otherForm.lineVol = this.volLevelList.find(item => item.dictValue === otherForm.volLevel)?.dictLabel;
                        if (this.type === "add") {
                            await simulation.addLine(otherForm);
                        } else {
                            await simulation.updateLine({ id, ...otherForm });
                        }
                        this.$modal.msgSuccess(`${this.titleText}成功`);
                        this.cancel();
                        this.$emit("success");
                    } catch (error) {
                        console.log(error);
                    } finally {
                        this.loading = false;
                    }
                }
            });
        },
        cancel() {
            this.$emit("update:visible", false);
            this.reset();
        },
        async getNodeList() {
            this.nodeList = (await simulation.getNodeList({
                pageNum: 1,
                pageSize: 100000000,
            })).respData?.list;
        },
        // 表单重置
        reset() {
            this.form = {
                id: "",
                lineName: "",
                lineCode: "",
                busiCode: "",
                volLever: "",
                linkModel: "",
                remark: "",
                linkKnow: "",
                lineImp: "",
                elecType: "",
                lineDir: "",
                tranCode: "",
                lineCur: "",
                status: 1,
                volLevel: "",
                lineVol: "",
                belongNode: 0,
                icon: "",
                lineLevel: "1",
                lineColor: "",
                lineLever: "",
                projectCode: "",
                belongMap: "",
                lineNode1: "",
                lineNode2: "",
                node1IsHead: "",
                scale: "",
            };
            this.resetForm("form");
        },
        async open() {
            let obj = this.row
            this.getNodeList();
            await this.getNodeTree();
            this.getDictList();
            this.getModelList();
            await this.getKey();
            if (!obj) {
                obj = {
                    lineDir: "1"
                }
            }
            this.reset();
            this.form = Object.assign(this.form, obj);
            this.levelColorMap = this.lineColorList.map(e => e.dictValue)
            this.form.lineColor = this.levelColorMap[this.form.lineLevel - 1];
        },
        async getDictList() {
            try {
                const { respData } = await simulation.nodeLinkKnow();
                this.dictList = respData || [];
            } catch (error) {
                console.log(error);
            }
        }
    },
};
</script>

<style lang="scss" scoped></style>
