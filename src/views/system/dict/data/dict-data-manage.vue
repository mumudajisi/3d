<template>
    <el-dialog
        v-bind="$attrs"
        :title="`${titleText}字典类型数据`"
        width="500px"
        :close-on-click-modal="false"
        append-to-body
        v-on="$listeners"
        @open="open"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="上级字典" prop="parentId">
                <treeselect v-model="form.parentId" :options="dictList" :normalizer="normalizer" :show-count="true" placeholder="请选择上级字典" />
            </el-form-item>
            <el-form-item label="字典名称" prop="dictName">
                <el-input v-model="form.dictName" placeholder="请输入字典名称" />
            </el-form-item>
            <el-form-item label="字典类型" prop="dictCode">
                <el-input v-model="form.dictCode" placeholder="请输入字典类型" />
            </el-form-item>
            <el-form-item label="显示排序" prop="dictSort">
                <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="form.status">
                    <el-radio :label="1">正常</el-radio>
                    <el-radio :label="0">停用</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="描述" prop="remark">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { dict } from "@/api";

export default {
    name: "DictDataManage",
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
            form: {
                parentId: 0,
                dictCode: undefined,
                dictName: "",
                dictSort: 0,
                status: 1,
                remark: "",
            },
            dictList: [],
            rules: {
                parentId: [{ required: true, message: "上级字典不能为空", trigger: "blur" }],
                dictCode: [{ required: true, message: "字典类型不能为空", trigger: "blur" }],
                dictName: [{ required: true, message: "字典名称不能为空", trigger: "blur" }],
            },
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
    methods: {
        /** 转换菜单数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.id,
                label: node.name,
                children: node.children,
            };
        },
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, parentId, dictName, dictCode, dictSort, status, remark } = this.form;
                        if (this.type === "add") {
                            await dict.addDict({ parentId, dictName, dictCode, dictSort, status, remark });
                        } else {
                            await dict.updateDict({
                                id,
                                parentId,
                                dictName,
                                dictCode,
                                dictSort,
                                status,
                                remark,
                            });
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
        async getDictTreeList() {
            try {
                const { respData } = await dict.getDictTree();
                this.dictList = [{ id: 0, name: "主类目", children: respData || [] }];
            } catch (error) {
                console.log(error);
            }
        },
        cancel() {
            this.$emit("update:visible", false);
            this.reset();
        },
        // 表单重置
        reset() {
            this.form = {
                parentId: 0,
                dictCode: undefined,
                dictName: "",
                dictSort: 0,
                status: 1,
                remark: "",
            };
            this.resetForm("form");
        },
        open() {
            this.getDictTreeList();
            this.reset();
            this.form = Object.assign(this.form, this.row);
        },
    },
};
</script>

<style lang="scss" scoped></style>
