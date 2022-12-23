<template>
    <el-dialog
        v-bind="$attrs"
        :title="`${titleText}词条类别`"
        width="500px"
        :close-on-click-modal="false"
        append-to-body
        v-on="$listeners"
        @open="open"
    >
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
            <el-form-item label="词条类别名称" prop="knowTypeName">
                <el-input v-model="form.knowTypeName" placeholder="请输入词条类别名称" />
            </el-form-item>
            <el-form-item label="父级类别" prop="parentId">
                <treeselect
                    v-model="form.parentId"
                    :options="knowTypeList"
                    :normalizer="normalizer"
                    :show-count="true"
                    placeholder="请选择父级类别"
                />
            </el-form-item>
            <el-form-item label="类别图标" prop="knowTypeIcon">
                <ImageUpload
                    :value="form.knowTypeIcon"
                    :f-name="imgName"
                    :limit="1"
                    dirname="/train3d/images/know/data"
                    @uploadImage="uploadImageBk"
                />
            </el-form-item>
            <el-form-item label="描述" prop="remark">
                <el-input v-model="form.remark" type="textarea" splaceholder="请输入内容" />
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button v-if="type != 'look'" type="primary" :loading="loading" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import ImageUpload from "@/components/ImageUpload/index.vue"
import { know } from "@/api";
import { getAttrsByKeys } from "@/utils";

export default {
    name: "KnowTypeManage",
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
                knowTypeName: "",
                knowTypeCode: "",
                parentId: 0,
                knowTypeIcon: "",
                remark: "",
            },
            imgName: "",
            knowTypeList: [],
            rules: {
                knowTypeName: [{ required: true, message: "词条类别名称不能为空", trigger: "blur" }],
                parentId: [{ required: true, message: "父级类别不能为空", trigger: "blur" }],
                knowTypeIcon: [{ required: true, message: "请上传词条类别图片", trigger: "blur" }]
            },
        };
    },
    computed: {
        titleText() {
            return {
                add: "添加",
                edit: "修改",
                look: "查看"
            }[this.type];
        },
    },
    methods: {
        uploadImageBk(data) {
            if (data.length) {
                this.imgName = data[0].name
                this.form.knowTypeIcon = data
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
                const { respData } = await know.getTypeTree();
                this.knowTypeList = [{ id: 0, name: "主类目", children: respData || [] }];
            } catch (error) {
                console.log(error);
            }
        },
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, ...otherForm } = getAttrsByKeys(this.form, "id,knowTypeName,knowTypeCode,knowTypeIcon,remark,parentId");
                        otherForm.knowTypeIcon = otherForm.knowTypeIcon[0].dirname + "/" + otherForm.knowTypeIcon[0].name;
                        if (this.type === "add") {
                            await know.addKnow(otherForm);
                        } else {
                            await know.updateKnow({
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
                knowTypeName: "",
                knowTypeCode: "",
                parentId: 0,
                knowTypeIcon: "",
                remark: "",
            };
            this.resetForm("form");
            this.imgName = "";
        },
        open() {
            this.reset();
            this.getTypeTree();
            this.form = Object.assign(this.form, this.row);
            if (this.type === "edit") {
                const iconDirname = this.form.knowTypeIcon.substring(this.form.knowTypeIcon.lastIndexOf("/"), 0)
                const iconName = this.form.knowTypeIcon.substring(this.form.knowTypeIcon.lastIndexOf("/"))
                this.form.knowTypeIcon = [{
                    dirname: iconDirname,
                    name: iconName.split("/")[1],
                    url: process.env.VUE_APP_RESOURCE_SERVER + this.form.knowTypeIcon + "?" + Math.random(),
                    status: "success"
                }]
                this.imgName = iconName.split("/")[1]
            }
        },
    },
};
</script>

<style lang="scss" scoped></style>
