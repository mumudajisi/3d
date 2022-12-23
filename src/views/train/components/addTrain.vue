<template>
    <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :title="title === 'edit' ? '编辑培训' : '新增培训'"
        destroy-on-close
        visible
        width="800px"
        @close="hideDialog"
    >
        <BaseForm
            ref="refForm"
            v-model="form.data"
            ref-form="refForm"
            :config="form.config"
            :enums="form.enums"
            :other-config="form.otherConfig"
        />
        <span slot="footer">
            <el-button @click="hideDialog">取 消</el-button>
            <el-button type="primary" @click="submit">确 定</el-button>
        </span>
    </el-dialog>
</template>
<script>
import BaseForm from "@/components/BaseFormNew";
import trainApi from "@/api/train"
import moment from "moment";
export default {
    name: "AddPaper",
    components: { BaseForm },
    props: {
        hideDialog: {
            type: Function,
            default() {
                return () => {};
            },
        },
        title: {
            type: String,
            default: "add",
        },
        row: {
            type: Object,
            default() {
                return {}
            },
        },
    },
    data() {
        return {
            dialogVisible: false,
            Visiable: false,
            form: {
                titleItems: [],
                otherConfig: {
                    labelWidth: "100px",
                    // disabled: false, // 是否全部禁用
                },
                config: [
                    {
                        col: 24,
                        type: "text",
                        name: "培训标题",
                        placeholder: "请输入培训标题",
                        bind: "trainName",
                        trigger: "blur",
                        required: "请输入培训标题",
                        callBc: this.callBc,
                    },
                    {
                        col: 24,
                        type: "text",
                        name: "培训地点",
                        placeholder: "请输入培训地点",
                        bind: "trainAddr",
                    },
                    {
                        col: 24,
                        type: "datePicker",
                        name: "培训时间",
                        bind: "dateTime",
                        trigger: "change",
                        required: "请选择培训时间",
                        dateType: "datetimerange",
                        valueFormat: "yyyy-MM-dd HH:mm:ss",
                        startPlaceholder: "请选择开始时间",
                        endPlaceholder: "请选择结束时间",
                        defaultTime: [moment().format("HH:mm:ss"), moment().format("HH:mm:ss")]
                    },
                    {
                        col: 24,
                        type: "tinymce",
                        name: "培训内容",
                        placeholder: "请输入培训内容",
                        bind: "content",
                        height: 220,
                        required: "请输入培训内容",
                        data: {
                            // 图片参数
                        }
                    }
                ],
                enums: {},
                data: {
                    dateTime: [],
                    trainName: "", // 培训标题
                    trainAddr: "", // 培训地点
                    content: "" // 培训内容
                },
            },
        };
    },
    mounted() {
        if (this.title === "edit") {
            this.form.data = JSON.parse(JSON.stringify(this.row));
            this.form.data.dateTime = [this.form.data.beginTime, this.form.data.closeTime]
        }
    },
    methods: {
        // 提交校验
        async submit() {
            const flg = this.$refs.refForm.validate()
            if (!flg) return false
            const params = {
                busiCode: "1001",
                bizCode: "1002",
                trainName: this.form.data.trainName,
                trainAddr: this.form.data.trainAddr,
                content: this.form.data.content,
                beginTime: this.form.data.dateTime[0],
                closeTime: this.form.data.dateTime[1],
                tranCode: this.title === "edit" ? 362102 : 362101,
            }
            const trainUrl = this.title === "edit" ? trainApi.infoEdit : trainApi.infoAdd
            if (this.title === "edit") {
                params.id = this.row.id
            }
            await trainUrl(params).then(res => {
                if (res.respType === 1) {
                    this.$message.success(this.title === "edit" ? "编辑成功" : "新增成功")
                    this.hideDialog()
                    this.$emit("success")
                }
            })
        },
    },
};
</script>

<style lang="scss" scoped>
.examPaper-class{
    display: inline-block;
}
</style>
