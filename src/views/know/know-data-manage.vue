<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}词条`" width="850px" :close-on-click-modal="false" append-to-body v-on="$listeners" @close="resetRule" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="词条标题" prop="knowTitle">
                        <el-input ref="fistFocus" v-model="form.knowTitle" placeholder="请输入词条标题" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="12">
                    <el-form-item label="词条编号" prop="knowCode">
                        <el-input v-model="form.knowCode" placeholder="请输入词条编号" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="词条类型" prop="knowTypeId">
                        <treeselect
                            v-model="form.knowTypeId"
                            :options="knowTypeList"
                            :normalizer="normalizer"
                            :show-count="true"
                            placeholder="请选择词条类型"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="12">
                    <el-form-item label="显示图片" prop="knowIcon">
                        <ImageUpload
                            :value="form.knowIcon"
                            :f-name="imgName"
                            :limit="1"
                            dirname="/train3d/images/know/data"
                            @uploadImage="uploadImageBk"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="词条热度" prop="isRecommend">
                        <el-input-number v-model="form.isRecommend" controls-position="right" :min="0" />
                    </el-form-item>
                    <el-form-item label="开放关联" prop="isBinding">
                        <el-switch v-model="form.isBinding" :active-value="1" :inactive-value="0" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="名词解释" prop="remark">
                        <el-input v-model="form.remark" type="textarea" :autosize="{ minRows: 4, maxRows: 4}" placeholder="请输入名称解释内容" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="词条内容" prop="knowContent">
                        <WangEditor
                            v-model="form.knowContent"
                            img-dirname="/train3d/images/know/contentImages"
                            video-dirname="/train3d/images/know/contentVideo"
                            @onBlur="editWang"
                        />
                    </el-form-item>
                    <div v-if="firstShow && !domText(form.knowContent)" style="color:red;padding-left: 100px;">内容不能为空</div>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="链接词条" prop="linkKnowIds">
                        <el-select v-model="form.linkKnowIds" filterable multiple style="width: 100%;" placeholder="请选择关联词条信息">
                            <template v-for="(item, i) in knowContentList">
                                <el-option :key="i" :label="item.knowTitle" :value="item.knowCode" />
                            </template>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="链接模型" prop="linkModelCode">
                        <el-select v-model="form.linkModelCode" filterable multiple style="width: 100%;" placeholder="请选择关联模型信息">
                            <el-option
                                v-for="item in modelContentList"
                                :key="item.id"
                                :label="item.modelTitle"
                                :value="item.modelLight"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button v-if="type != 'look'" type="primary" :loading="loading" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import WangEditor from "@/components/WangEditor/uploadWangeditor";
import Treeselect from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"
import ImageUpload from "@/components/ImageUpload/index.vue"
import { know } from "@/api"
import { model } from "@/api"
import { getAttrsByKeys } from "@/utils"
import { mapGetters } from "vuex"

export default {
    name: "KnowDataManage",
    components: { Treeselect, WangEditor, ImageUpload },
    props: {
        type: {
            type: String,
            default: "add"
        },
        row: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            firstShow: false,
            loading: false,
            form: {
                knowTitle: "",
                knowTypeId: null,
                knowContent: "",
                knowIcon: "",
                isRecommend: 0,
                isBinding: 0,
                remark: "",
                linkKnowIds: [],
                linkModelCode: [],
                knowCode: ""
            },
            imgName: "",
            emptyForm: {
                knowTitle: "",
                knowTypeId: null,
                knowContent: "",
                knowIcon: "",
                isRecommend: 0,
                isBinding: 0,
                remark: "",
                knowCode: ""
            },
            knowTypeList: [],
            knowContentList: [],
            modelContentList: [],
            rules: {
                knowCode: [{ required: true, message: "词条编号不能为空", trigger: "blur" }],
                knowTitle: [{ required: true, message: "词条标题不能为空", trigger: "blur" }],
                knowTypeId: [{ required: true, message: "词条类型不能为空", trigger: ["input"] }],
                knowContent: [{ required: true, message: "", trigger: ["blur"] }],
                knowIcon: [{ required: true, message: "请上传图片", trigger: ["blur"] }],
            }
        }
    },
    computed: {
        ...mapGetters(["token"]),
        titleText() {
            return {
                add: "添加",
                edit: "修改",
                look: "查看"
            }[this.type]
        },
        headers() {
            return {
                Authorization: "Bearer " + this.token
            }
        },
        action() {
            return (process.env.NODE_ENV === "development" ? "/api" : process.env.VUE_APP_BASE_API) + "/file/upload"
        },
        domText() {
            return (text) => {
                return this.parseDom(text).innerText;
            }
        }
    },
    mounted() {
        this.open()
    },
    methods: {
        editWang() {
            this.firstShow = true;
        },
        parseDom(arg) {
            var objE = document.createElement("div");
            objE.innerHTML = arg;
            return objE;
        },
        // 图片上传
        uploadImageBk(data) {
            if (data.length) {
                this.imgName = data[0].name
                this.form.knowIcon = data
            }
        },
        // 文件上传返回的参数
        onSuccess(response, file, fileList) {
            console.log(response, file, fileList)
        },
        onError(err, file, fileList) {
            console.log(err, file, fileList)
        },
        /** 转换菜单数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children
            }
            return {
                id: node.id,
                label: node.name,
                children: node.children
            }
        },
        submitForm() {
            this.firstShow = true;
            this.$refs["form"].validate(async (valid) => {
                if (!this.domText(this.form.knowContent)) {
                    return;
                }
                if (valid) {
                    try {
                        this.loading = true
                        const { id, ...otherForm } = getAttrsByKeys(
                            this.form,
                            "id,knowTitle,knowTypeId,knowContent,knowCode,knowIcon,linkModelCode,isRecommend,isBinding,linkKnowIds,remark"
                        )
                        otherForm.knowIcon = otherForm.knowIcon[0].dirname + "/" + otherForm.knowIcon[0].name;
                        if (this.type === "add") {
                            await know.addKnowData(otherForm)
                        } else {
                            await know.updateKnowData({
                                id,
                                ...otherForm
                            })
                        }
                        this.$modal.msgSuccess(`${this.titleText}成功`)
                        this.cancel()
                        this.$emit("success")
                    } catch (error) {
                        console.log(error)
                    } finally {
                        this.loading = false
                    }
                }
            })
        },
        resetRule() {
            this.resetForm("form")
        },
        cancel() {
            this.$emit("update:visible", false)
            this.reset()
        },
        async getTypeTree() {
            try {
                const { respData } = await know.getTypeTree()
                this.knowTypeList = respData || []
            } catch (error) {
                console.log(error)
            }
        },
        // 表单以及规则重置
        reset() {
            this.form = {
                knowTitle: "",
                knowTypeId: undefined,
                knowContent: "",
                knowIcon: "",
                isRecommend: 0,
                isBinding: 0,
                remark: "",
                linkKnowIds: [],
                linkModelCode: [],
                knowCode: ""
            };
            this.imgName = "";
            this.resetForm("form")
        },
        async getDictList() {
            this.dictList = await know.getKnowDataList({
                pageNum: 1,
                pageSize: 100000000,
            });
            this.knowContentList = this.dictList.respData.list
        },
        async getModelList() {
            this.modelList = await model.getModelDataList({
                pageNum: 1,
                pageSize: 100000000,
            });
            this.modelContentList = this.modelList.respData.list
        },
        async open() {
            this.reset()
            this.$nextTick(() => {
                this.$refs.fistFocus.focus()
            })
            this.getDictList();
            this.getModelList();
            await this.getTypeTree()
            Object.assign(this.form, this.row)
            if (this.form.solveProblem) {
                this.form.linkKnowIds = JSON.parse(this.form.solveProblem)
            }
            if (this.form.linkModelCode.length) {
                this.form.linkModelCode = JSON.parse(this.form.linkModelCode)
            }
            this.firstShow = false
            if (this.type !== "add") {
                const iconDirname = this.form.knowIcon.substring(this.form.knowIcon.lastIndexOf("/"), 0)
                const iconName = this.form.knowIcon.substring(this.form.knowIcon.lastIndexOf("/"))
                this.form.knowIcon = [{
                    dirname: iconDirname,
                    name: iconName.split("/")[1],
                    url: process.env.VUE_APP_RESOURCE_SERVER + this.form.knowIcon + "?" + Math.random(),
                    status: "success"
                }]
                this.imgName = iconName.split("/")[1]
            }
        },
    }
}
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
