<template>
    <el-dialog
        v-bind="$attrs"
        :title="`${titleText}模型类别`"
        width="500px"
        :close-on-click-modal="false"
        append-to-body
        v-on="$listeners"
        @open="open"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
            <el-form-item label="模型类别名称" prop="modelTypeName">
                <el-input v-model="form.modelTypeName" placeholder="请输入模型类别名称" />
            </el-form-item>
            <el-form-item label="父级类别" prop="parentId">
                <treeselect
                    v-model="form.parentId"
                    :options="modelTypeList"
                    :normalizer="normalizer"
                    :show-count="true"
                    placeholder="请选择父级类别"
                />
            </el-form-item>
            <el-form-item label="模型类型图标" prop="modelTypeIcon">
                <ImageUpload
                    :value="form.modelTypeIcon"
                    :f-name="imgName"
                    :limit="1"
                    dirname="/train3d/images/model/data"
                    @uploadImage="uploadImageBk"
                />
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
import ImageUpload from "@/components/ImageUpload/index.vue"
import { model } from "@/api";
import { getAttrsByKeys } from "@/utils";

export default {
    name: "ModelTypeManage",
    components: { Treeselect, ImageUpload },
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
                modelTypeName: "",
                parentId: 0,
                modelTypeIcon: "",
                remark: "",
            },
            imgName: "",
            modelTypeList: [],
            rules: {
                modelTypeName: [{ required: true, message: "模型类别名称不能为空", trigger: "blur" }],
                parentId: [{ required: true, message: "父级类别不能为空", trigger: "blur" }],
                modelTypeIcon: [{ required: true, message: "请上传模型类别图标", trigger: "blur" }],
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
        uploadImageBk(data) {
            if (data.length) {
                this.imgName = data[0].name
                this.form.modelTypeIcon = data
            }
        },
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
        async getTypeTree() {
            try {
                const { respData } = await model.getTypeTree();
                this.modelTypeList = [{ id: 0, name: "主类目", children: respData || [] }];
            } catch (error) {
                console.log(error);
            }
        },
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, ...otherForm } = getAttrsByKeys(this.form, "id,modelTypeName,modelTypeIcon,parentId,remark");
                        otherForm.modelTypeIcon = otherForm.modelTypeIcon[0].dirname + "/" + otherForm.modelTypeIcon[0].name;
                        if (this.type === "add") {
                            await model.addModel(otherForm);
                        } else {
                            await model.updateModel({
                                id,
                                ...otherForm,
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
        cancel() {
            this.$emit("update:visible", false);
            this.reset();
        },
        // 表单重置
        reset() {
            this.form = {
                modelTypeName: "",
                parentId: 0,
                modelTypeIcon: "",
                remark: "",
            };
            this.imgName = "";
            this.resetForm("form");
        },
        open() {
            this.reset();
            this.getTypeTree();
            this.form = Object.assign(this.form, this.row);
            if (this.type === "edit") {
                const iconDirname = this.form.modelTypeIcon.substring(this.form.modelTypeIcon.lastIndexOf("/"), 0)
                const iconName = this.form.modelTypeIcon.substring(this.form.modelTypeIcon.lastIndexOf("/"))
                this.form.modelTypeIcon = [{
                    dirname: iconDirname,
                    name: iconName.split("/")[1],
                    url: process.env.VUE_APP_RESOURCE_SERVER + this.form.modelTypeIcon + "?" + Math.random(),
                    status: "success"
                }]
                this.imgName = iconName.split("/")[1]
            }
        },
    },
};
</script>

<style lang="scss" scoped></style>
