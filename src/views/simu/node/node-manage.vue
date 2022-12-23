<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}节点`" width="800px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="115px">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="节点名称" prop="nodeName">
                        <el-input v-model="form.nodeName" placeholder="请输入节点名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="上级节点" prop="parentId">
                        <treeselect
                            v-model="form.parentId"
                            :options="nodeTreeList"
                            :normalizer="normalizer"
                            :show-count="true"
                            placeholder="请选择上级节点"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="节点类型" prop="nodeType">
                        <BaseSelect v-model="form.nodeType" style="width: 100%" type="node_type" placeholder="请选择节点类型" @change="choosePer()" />
                    </el-form-item>
                </el-col>
                <el-col v-if="showHide" :span="12">
                    <el-form-item label="发电功率(MW)" prop="nodePower">
                        <el-input v-model="form.nodePower" placeholder="请输入发电功率" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="节点电压" prop="nodeVol">
                        <BaseSelect v-model="form.nodeVol" style="width: 100%" type="vol_level" placeholder="请选择节点电压" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="关联词条" prop="knowPoint">
                        <el-select v-model="form.knowPoint" filterable style="width: 100%;" placeholder="请选择关联词条信息">
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
                <el-col :span="12">
                    <el-form-item label="经度" prop="longitude">
                        <el-input v-model="form.longitude" placeholder="请输入节点经度" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="纬度" prop="latitude">
                        <el-input v-model="form.latitude" placeholder="请输入节点纬度" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="节点地址" prop="nodeAddr">
                        <el-input v-model="form.nodeAddr" placeholder="请输入节点地址" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="工程编号" prop="projectCode">
                        <el-input v-model="form.projectCode" placeholder="请输入节点工程" />
                    </el-form-item>
                </el-col>
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
import { mapGetters } from "vuex";
import { know } from "@/api"
import { model } from "@/api"
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    name: "NodeManage",
    components: { Treeselect },
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
            nodeTreeList: [],
            form: {
                id: "",
                parentId: "",
                nodeName: "",
                nodeCode: "",
                nodeType: "",
                nodeLine: "",
                nodeLevel: "",
                nodeVol: "",
                nodeAddr: "",
                nodeBelong: "",
                linkModel: "",
                knowPoint: "",
                nodeImage: "",
                status: "",
                remark: "",
                longitude: "",
                latitude: "",
                nodePower: 0,
                projectCode: "",
            },
            dictList: [],
            noleList: [],
            modelList: [],
            knowList: [],
            showHide: false,
            rules: {
                nodeName: [{ required: true, message: "节点名称不能为空", trigger: "blur" }],
                nodeType: [{ required: true, message: "节点类型不能为空", trigger: "blur" }],
                // longitude: [{ required: true, message: "节点经度不能为空", trigger: "blur" }],
                // latitude: [{ required: true, message: "节点纬度不能为空", trigger: "blur" }],
                longitude: [{ pattern: /^(([1-9]{1}\d*)|(0{1}))(\.\d*)?$/, required: true, message: "节点经度不符合规范或者为空", trigger: "blur" }],
                latitude: [{ pattern: /^(([1-9]{1}\d*)|(0{1}))(\.\d*)?$/, required: true, message: "节点纬度不符合规范或者为", trigger: "blur" }],
                nodeVol: [{ required: true, message: "节点电压不能为空", trigger: "blur" }],
                knowPoint: [{ required: true, message: "关联词条信息不能为空", trigger: "blur" }],
                linkModel: [{ required: true, message: "关联模型信息不能为空", trigger: "blur" }],
                projectCode: [{ required: true, message: "工程编号不能为空", trigger: "blur" }],
                nodePower: [{ pattern: /^(([1-9]{1}\d*)|(0{1}))(\.\d*)?$/, required: true, message: "发电功率不能为空或者小于0", trigger: "blur" }],
            },
        };
    },
    computed: {
        ...mapGetters(["token"]),
        titleText() {
            return {
                add: "添加",
                edit: "修改",
            }[this.type];
        },
    },
    created() {
        this.getKnowList()
        this.getModelList()
        this.getNodeTree()
        this.choosePer()
    },
    methods: {
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
        async getNodeTree() {
            try {
                const { respData } = await simulation.getNodeTree();
                this.nodeTreeList = [{ id: 0, name: "中国", children: respData || [] }];
            } catch (error) {
                console.log(error);
            }
        },
        async getKnowList() {
            this.knowList = (await know.getKnowDataList({
                pageNum: 1,
                pageSize: 100000000,
            })).respData.list;
        },
        async getModelList() {
            this.modelList = (await model.getModelDataList({
                pageNum: 1,
                pageSize: 100000000,
            })).respData.list;
        },
        choosePer() {
            if (this.form.nodeType === "7") {
                this.showHide = true;
            } else {
                this.showHide = false;
            }
        },
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, ...otherForm } = getAttrsByKeys(
                            this.form,
                            "id,parentId,nodeCode,projectCode,nodeName,nodePower,nodeVol,nodeType,nodeLine,nodeLevel,remark,nodeAddr,nodeBelong,nodeImage,linkModel,knowPoint,status,longitude,latitude"
                        );
                        if (!this.form.nodePower) {
                            otherForm.nodePower = 0
                        }
                        if (this.type === "add") {
                            await simulation.addNode(otherForm);
                        } else {
                            await simulation.updateNode({ id, ...otherForm });
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
        // 表单重置
        reset() {
            this.form = {
                id: "",
                parentId: 0,
                nodeName: "",
                nodeCode: "",
                nodeType: "",
                nodeLine: "",
                nodeLevel: "",
                nodeVol: "",
                nodeAddr: "",
                nodeBelong: "",
                nodeImage: "",
                linkModel: "",
                knowPoint: "",
                status: 1,
                longitude: "",
                latitude: "",
                nodePower: "",
                projectCode: "",
            };
            this.showHide = false;
            this.resetForm("form");
        },
        open() {
            this.getDictList();
            this.reset();
            this.form = Object.assign(this.form, this.row);
            if (this.form.nodeType === "7") { this.showHide = true }
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
