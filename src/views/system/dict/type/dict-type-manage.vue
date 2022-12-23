<template>
    <el-dialog
        v-bind="$attrs"
        :title="`${titleText}字典数据`"
        width="500px"
        :close-on-click-modal="false"
        append-to-body
        v-on="$listeners"
        @open="open"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="字典类型" prop="dictCode">
                <treeselect
                    v-model="form.dictCode"
                    :options="dictList"
                    :normalizer="normalizer"
                    disabled
                    :show-count="true"
                    placeholder="请选择字典类型"
                />
                <!-- <el-input v-model="form.dictCode" disabled placeholder="请输入字典类型" /> -->
            </el-form-item>
            <el-form-item label="字典描述" prop="dictLabel">
                <el-input v-model="form.dictLabel" placeholder="请输入字典描述" />
            </el-form-item>
            <el-form-item label="字典健值" prop="dictValue">
                <el-input v-model="form.dictValue" placeholder="请输入字典健值" />
            </el-form-item>
            <el-form-item label="样式属性" prop="cssClass">
                <el-input v-model="form.cssClass" placeholder="请输入样式属性" />
            </el-form-item>
            <el-form-item label="显示排序" prop="dictSort">
                <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="回显样式" prop="listClass">
                <el-select v-model="form.listClass" placeholder="请选择">
                    <el-option label="默认(default)" value="default" />
                    <el-option label="主要(primary)" value="primary" />
                    <el-option label="成功(success)" value="success" />
                    <el-option label="信息(info)" value="info" />
                    <el-option label="警告(warning)" value="warning" />
                    <el-option label="危险(danger)" value="danger" />
                </el-select>
            </el-form-item>
            <el-form-item label="是否默认" prop="isDefault">
                <el-select v-model="form.isDefault" placeholder="请选择">
                    <el-option label="是" value="Y" />
                    <el-option label="否" value="N" />
                </el-select>
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
    name: "DictTypeManage",
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
                dictCode: undefined,
                dictLabel: "",
                dictValue: "",
                cssClass: "",
                dictSort: 0,
                listClass: "default",
                isDefault: "N",
                status: 1,
                remark: "",
            },
            dictList: [],
            rules: {
                dictCode: [{ required: true, message: "字典类型不能为空", trigger: "blur" }],
                dictLabel: [{ required: true, message: "枚举描述不能为空", trigger: "blur" }],
                dictValue: [{ required: true, message: "枚举健值不能为空", trigger: "blur" }],
                dictSort: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
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
                id: node.dictCode,
                label: node.name,
                children: node.children,
            };
        },
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, dictCode, dictLabel, dictValue, cssClass, dictSort, listClass, isDefault, status, remark } = this.form;
                        if (this.type === "add") {
                            await dict.addDictData({ dictCode, dictLabel, dictValue, cssClass, dictSort, listClass, isDefault, status, remark });
                        } else {
                            await dict.updateDictData({
                                id,
                                dictCode,
                                dictLabel,
                                dictValue,
                                cssClass,
                                dictSort,
                                listClass,
                                isDefault,
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
                this.dictList = respData || [];
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
                dictCode: undefined,
                dictLabel: "",
                dictValue: "",
                cssClass: "",
                dictSort: 0,
                listClass: "",
                isDefault: "N",
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
