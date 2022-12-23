<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}模型`" width="600px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="模型编号" prop="modelLight">
                <el-input v-model="form.modelLight" placeholder="请输入模型编号" />
            </el-form-item>
            <el-form-item label="模型名称" prop="modelTitle">
                <el-input v-model="form.modelTitle" placeholder="请输入模型名称" />
            </el-form-item>
            <el-form-item label="模型类别" prop="modelTypeId">
                <treeselect
                    v-model="form.modelTypeId"
                    :options="modelTypeList"
                    :normalizer="normalizer"
                    :show-count="true"
                    placeholder="请选择模型类别"
                />
            </el-form-item>
            <el-form-item label="模型上传" prop="fileName">
                <FileUpload
                    :is-verify-file-type="true"
                    :is-check-file-type="true"
                    dirname="/files/resource/1002"
                    :file-type="['zip']"
                    :value="form.fileName"
                    :limit="1"
                    :f-name="files"
                    @uploadFiles="uploadFiles"
                />
            </el-form-item>
            <el-form-item label="模型路径" prop="modelPath">
                <el-input v-model="form.modelPath" placeholder="模型路径" disabled />
            </el-form-item>
            <el-form-item v-if="false" label="模型大小" prop="modelSize">
                <el-input v-model="form.modelSize" placeholder="请输入模型大小" />
            </el-form-item>
            <el-form-item v-if="false" label="关联词条" prop="linkKnowId">
                <el-select v-model="form.linkKnowId" filterable placeholder="请选择关联词条" style="width: 100%" clearable>
                    <el-option
                        v-for="item in knowList"
                        :key="item.id"
                        :label="item.knowTitle"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="开放关联" prop="isBinding">
                <el-switch v-model="form.isBinding" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="模型图标" prop="modelIcon">
                <ImageUpload
                    :value="form.modelIcon"
                    :f-name="imgName"
                    :limit="1"
                    dirname="/train3d/images/model/data"
                    @uploadImage="uploadImageBk"
                />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
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
import FileUpload from "@/components/FileUpload/index.vue"
import { model } from "@/api";
import { getAttrsByKeys } from "@/utils";
import { mapGetters } from "vuex";
import { know } from "@/api";

export default {
    name: "ModelDataManage",
    components: { Treeselect, ImageUpload, FileUpload },
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
                id: "",
                modelTitle: "",
                modelTypeId: undefined,
                modelPath: "",
                fileName: [],
                modelSize: "",
                isBinding: 0,
                linkKnowId: "",
                modelIcon: {},
                modelLight: "",
                modelMode: "",
                modelVersion: "",
                remark: "",
                isUnzip: 0,
            },
            imgName: "",
            files: "",
            modelTypeList: [],
            rules: {
                modelTitle: [{ required: true, message: "模型名称不能为空", trigger: "blur" }],
                modelTypeId: [{ required: true, message: "模型类别不能为空", trigger: "blur" }],
                modelIcon: [{ required: true, message: "模型图标不能为空", trigger: "blur" }],
                modelLight: [{ required: true, message: "模型编号不能为空", trigger: "blur" }],
                fileName: [{ required: true, message: "请上传文件", trigger: "blur" }],
            },
            knowList: [],
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
        headers() {
            return {
                Authorization: "Bearer " + this.token,
            };
        },
        action() {
            return (process.env.NODE_ENV === "development" ? "/api" : process.env.VUE_APP_BASE_API) + "/file/upload";
        },
    },
    created() {
        this.getKnowList()
    },
    methods: {
        // 图片上传
        uploadImageBk(data) {
            if (data.length) {
                this.imgName = data[0].name
                this.form.modelIcon = data
            }
        },
        // 文件上传
        uploadFiles(data) {
            if (data.length) {
                this.form.isUnzip = 0
                this.files = data[0].name
                this.form.fileName = data;
                this.form.modelPath = data[0].dirname;
            }
        },
        // 查询词条信息
        async getKnowList() {
            this.knowList = (await know.getKnowDataList({
                pageNum: 1,
                pageSize: 100000000,
            })).respData.list;
        },
        onSuccess(response, file, fileList) {
            console.log(response, file, fileList);
        },
        onError(err, file, fileList) {
            console.log(err, file, fileList);
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
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, ...otherForm } = getAttrsByKeys(
                            this.form,
                            "id,modelTitle,isBinding,fileName,modelTypeId,modelPath,modelSize,linkKnowId,modelIcon,modelLight,modelMode,modelVersion,remark,isUnzip",
                        );
                        otherForm.modelIcon = otherForm.modelIcon[0].dirname + "/" + otherForm.modelIcon[0].name;
                        otherForm.fileName = otherForm.fileName[0].name.split("?")[0];
                        // 词条判断
                        if (!otherForm.linkKnowId) {
                            otherForm.linkKnowId = "0";
                        }
                        if (this.type === "add") {
                            await model.addModelData(otherForm);
                        } else {
                            await model.updateModelData({
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
                id: "",
                modelTitle: "",
                modelTypeId: undefined,
                modelPath: "",
                modelSize: "",
                linkKnowId: "",
                isBinding: 0,
                modelIcon: "",
                fileName: [],
                modelLight: "",
                modelMode: "",
                modelVersion: "",
                remark: "",
                isUnzip: 0,
            };
            this.imgName = "";
            this.files = "";
            this.resetForm("form");
        },
        async getTypeTree() {
            try {
                const { respData } = await model.getTypeTree();
                this.modelTypeList = respData || [];
            } catch (error) {
                console.log(error);
            }
        },
        open() {
            this.reset();
            this.getTypeTree();
            if (this.row?.linkKnowId === 0) {
                this.row.linkKnowId = ""
            }
            this.form = Object.assign(this.form, this.row);
            if (this.type === "edit") {
                const iconDirname = this.form.modelIcon.substring(this.form.modelIcon.lastIndexOf("/"), 0)
                const iconName = this.form.modelIcon.substring(this.form.modelIcon.lastIndexOf("/"))
                this.form.modelIcon = [{
                    dirname: iconDirname,
                    name: iconName.split("/")[1],
                    url: process.env.VUE_APP_RESOURCE_SERVER + this.form.modelIcon + "?" + Math.random(),
                    status: "success"
                }]
                this.imgName = iconName.split("/")[1]
                this.form.fileName = [{
                    dirname: this.row.modelPath,
                    name: this.row.fileName,
                    url: process.env.VUE_APP_RESOURCE_SERVER + this.row.modelPath + "/" + this.row.fileName + "?" + Math.random(),
                    status: "success"
                }]
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.avatar-uploader::v-deep .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}
.avatar {
    width: 100px;
    height: 100px;
    display: block;
}
</style>
