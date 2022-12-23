<template>
    <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :title="title === 'edit' ? '编辑考试' : '新增考试'"
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
import BaseForm from "@/components/BaseFormNew"
import moment from "moment"
import mgrApi from "@/api/exam"
import paperApi from "@/api/paper"
export default {
    name: "ExamAddOrEdit",
    components: { BaseForm },
    props: {
        hideDialog: {
            type: Function,
            default() {
                return () => {
                }
            }
        },
        title: {
            type: String,
            default: "add"
        },
        row: {
            type: Object,
            default() {
                return null;
            }
        },
        dictList: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            form: {
                otherConfig: {
                    labelWidth: "110px"
                },
                config: [
                    {
                        col: 12,
                        type: "select",
                        name: "考试试卷",
                        placeholder: "请选择考试试卷",
                        bind: "paperCode",
                        dataList: "paperIdList",
                        trigger: "blur",
                        required: "请选择考试试卷",
                        callBc: this.callBc,
                    },
                    {
                        col: 12,
                        type: "text",
                        name: "考试名称",
                        placeholder: "请输入考试名称",
                        bind: "examName",
                        trigger: "change",
                        required: "请输入考试名称",
                    },
                    // {
                    //     col: 12,
                    //     type: "select",
                    //     name: "考试模式",
                    //     callBc: this.callBc,
                    //     placeholder: "请选择考试模式",
                    //     bind: "examMode",
                    //     trigger: "blur",
                    //     dataList: "examModeList",
                    //     required: "请选择考试模式",
                    // },
                    {
                        col: 12,
                        type: "text",
                        name: "考场位置",
                        placeholder: "请输入考场位置",
                        bind: "examAddr",
                        trigger: "change",
                    },
                    {
                        col: 12,
                        type: "number",
                        name: "考试时长(M)",
                        placeholder: "请输入考试时长(分钟)",
                        bind: "examTimes",
                        trigger: "change",
                        required: "请输入考试时长",
                        callBc: this.callBc
                    },
                    {
                        col: 12,
                        type: "datePicker",
                        name: "考试开始时间",
                        placeholder: "请选择考试开始时间",
                        bind: "examTime",
                        trigger: "change",
                        required: "请选择考试开始时间",
                        dateType: "datetime",
                        defaultValue: new Date(),
                        valueFormat: "yyyy-MM-dd HH:mm:ss",
                        callBc: this.callBc
                    },
                    {
                        col: 12,
                        type: "datePicker",
                        name: "考试结束时间",
                        placeholder: "请选择考试结束时间",
                        disabled: true,
                        bind: "deadline",
                        trigger: "change",
                        required: "请选择考试结束时间",
                        dateType: "datetime",
                        defaultValue: new Date(),
                        valueFormat: "yyyy-MM-dd HH:m·m:ss",
                    },
                ],
                enums: {
                    examModeList: this.dictList.examModeList, // 考试模式
                    paperIdList: [], // 考试试卷
                },
                data: {
                    examName: "",
                    examMode: "1",
                    paperCode: "",
                    examAddr: "",
                    examTimes: "",
                    examTime: "",
                    deadline: "",
                }
            }
        }
    },
    mounted() {
        this.examSearch() // 试卷查询
        if (this.title === "edit") {
            this.edit(); // 编辑
        }
    },
    methods: {
        edit() {
            this.examSearch() // 试卷查询
            this.row.examTimes = String(this.row.examTimes)
            this.row.examMode = String(this.row.examMode)
            this.form.data = this.row
        },
        // 考试新增成功
        async submit() {
            const flg = this.$refs.refForm.validate()
            if (!flg) return false
            const params = {
                busiCode: "1001",
                tranCode: this.title === "edit" ? 361602 : 361601,
                ...this.form.data,
            }
            const mgrUrl = this.title === "edit" ? mgrApi.mgrEdit : mgrApi.mgrAdd
            if (this.title === "edit") {
                params.id = this.row.id
            }
            await mgrUrl(params).then(res => {
                if (res.respType === 1) {
                    this.$message.success(this.title === "edit" ? "编辑成功" : "新增成功")
                    this.hideDialog()
                    this.$emit("success")
                }
            })
        },
        callBc(item, bind) {
            if (item.bind === "examTimes" || item.bind === "examTime") {
                if (this.form.data.examTimes && this.form.data.examTime) {
                    const startDate = new Date(this.form.data.examTime)
                    const endDate = startDate.getTime() + 60 * 1000 * this.form.data.examTimes
                    this.form.data.deadline = moment(endDate).format("YYYY-MM-DD HH:mm:ss")
                }
            } else if (item.bind === "paperCode") {
                this.$set(this.form.data, "examName", this.$getFindValue(
                    String(bind),
                    this.form.enums.paperIdList,
                    "dictValue",
                    "dictLabel"
                ))
            }
        },
        // 试卷查询
        async examSearch() {
            const params = {
                busiCode: "1001",
                tranCode: "361405",
                examMode: this.form.data.examMode,
            }
            await paperApi.examPaperSelect(params).then(res => {
                const arr = []
                if (res.respType === 1) {
                    res.respData.forEach(item => {
                        arr.push({
                            dictLabel: item.paperName,
                            dictValue: item.paperCode
                        })
                    })
                    this.form.enums.paperIdList = arr
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped></style>
