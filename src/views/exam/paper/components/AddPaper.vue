<template>
    <el-dialog
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :title="title === 'edit' ? '编辑试卷' : '新增试卷'"
        append-to-body
        destroy-on-close
        visible
        width="900px"
        @close="hideDialog"
    >
        <BaseForm
            ref="refForm"
            v-model="form.data"
            :config="form.config"
            :enums="form.enums"
            :other-config="form.otherConfig"
            ref-form="refForm"
        >
            <template v-for="(titleItem,index) in titleItems" slot="slotName">
                <div v-if="form.data.bankCode" :key="index" style="margin-bottom: 17px;">
                    <span style="margin-left:-60px;font-size:14px;color:#606266;font-weight:700;text-align: right">
                        <span style="color: #f00;">*</span>
                        标题{{ index + 1 }}
                    </span>
                    <el-input v-model="titleItem.title.name" :placeholder="'输入标题' + (index + 1)" style="width: 74% ;margin-left:10px" />
                    <el-button size="mini" style="margin-left: 10px" type="text" @click="addTitle">
                        添加标题
                    </el-button>
                    <el-button size="mini" style="margin-left: 10px" type="text" @click="addQuestion(index)">
                        添加题目
                    </el-button>
                    <el-button
                        v-if="titleItems.length > 1"
                        style="color:red" type="text"
                        @click="titleItems.splice(index,1)"
                    >
                        删除
                    </el-button>
                    <QuestionShow
                        v-if="titleItem.items.length"
                        :items="titleItem.items"
                        @questionDelete="questionDelete($event,index)"
                    />
                </div>
            </template>
        </BaseForm>
        <PaperTopic
            v-if="Visible"
            ref="dialog"
            :bank-code="form.data.bankCode"
            :hide-dialog="() => (Visible = false)"
            :major="form.data.major"
            @submit="topicSubmit"
        />
        <span slot="footer">
            <el-button @click="hideDialog">取 消</el-button>
            <el-button type="primary" @click="submit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import BaseForm from "@/components/BaseFormNew"
import PaperTopic from "@/views/exam/paper/components/PaperTopic"
import QuestionShow from "@/views/exam/paper/components/QuestionShow"
import { bank, paper } from "@/api"

export default {
    name: "AddPaper",
    components: { BaseForm, PaperTopic, QuestionShow },
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
        dictList: {
            type: Object,
            default() {
                return {}
            }
        },
        rowList: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            dialogVisible: false,
            Visible: false,
            titleItemIndex: 0, // 点击添加题目的下标
            titleItems: [
                {
                    title: { seq: 1, name: "" },
                    items: []
                }
            ],
            form: {
                otherConfig: {
                    labelWidth: "100px"
                    // disabled: false, // 是否全部禁用
                },
                config: [
                    {
                        col: 12,
                        type: "text",
                        name: "试卷名称",
                        placeholder: "请输入试卷名称",
                        bind: "paperName",
                        trigger: "change",
                        required: "请输入试卷名称",
                        rules: []
                    },
                    {
                        col: 12,
                        type: "text",
                        name: "试卷编号",
                        placeholder: "请输入试卷编号",
                        bind: "paperCode",
                        trigger: "blur",
                        disabled: true,
                        required: "请输入试卷编号",
                        showHide: this.showHide,
                        rules: []
                    },
                    {
                        col: 12,
                        type: "select",
                        name: "试卷类型",
                        placeholder: "请选择试卷类型",
                        bind: "paperType",
                        trigger: "blur",
                        dataList: "paperTypeList",
                        required: "请选择试卷类型",
                        rules: []
                    },
                    // {
                    //     col: 12,
                    //     type: "select",
                    //     name: "专业类型",
                    //     placeholder: "请选择专业类型",
                    //     dataList: "majorList",
                    //     bind: "major",
                    //     trigger: "blur",
                    //     required: "请选择专业类型",
                    //     rules: [],
                    //     callBc: this.callBc
                    // },
                    {
                        col: 24,
                        type: "select",
                        name: "题库",
                        placeholder: "请选择题库",
                        dataList: "bankCodeList",
                        bind: "bankCode",
                        trigger: "blur",
                        required: "请选择题库",
                        showHide: this.showHide,
                        rules: []
                    },
                    {
                        col: 24,
                        type: "slot",
                        slotName: "slotName",
                        placeholder: "请输入标题",
                        bind: "paperItems"
                    }
                ],
                enums: {
                    paperTypeList: this.dictList.paperTypeList,
                    majorList: this.dictList.majorList,
                    bankCodeList: this.dictList.bankCodeList,
                },
                data: {
                    paperName: "",
                    paperCode: "",
                    paperType: "1",
                    major: "0",
                    areaCode: "320000", // 区域代码
                    bankCode: "",
                    paperItems: ""
                }
            }
        }
    },
    mounted() {
        if (this.title === "edit") {
            this.getBankCode()
            const obj = JSON.parse(JSON.stringify(this.rowList))
            obj.paperType = String(obj.paperType)
            obj.topics.map(item => {
                item.items.map(val => {
                    if (val.topicType === "1" || val.topicType === "2" || val.topicType === "3") {
                        val.options = JSON.parse(val.options)
                    }
                })
            })
            this.form.data = obj
            this.titleItems = obj.topics
        }
    },
    methods: {
        // 选择题目返回的数据
        topicSubmit(data) {
            let arr = []
            this.titleItems.forEach(item => {
                arr = arr.concat(item.items)
            })
            const objArr = data.filter(val => arr.find(item => val.id === item.id))
            if (objArr.length) {
                objArr.forEach(item => {
                    data.forEach((val, index) => {
                        if (item.id === val.id) {
                            data.splice(index, 1)
                        }
                    })
                })
                this.$message.warning("已为您过滤重复题目")
            }
            if (data.length) {
                this.titleItems[this.titleItemIndex].items = this.titleItems[this.titleItemIndex].items.concat(data)
            }
        },
        // 提交校验信息
        submit: function () {
            const flg = this.$refs.refForm.validate()
            if (!flg) return false
            let str = ""
            let str1 = ""
            this.titleItems.forEach((item, index) => {
                if (item.title.name === "") {
                    if (str === "") {
                        str += "请检查以下信息：请输入标题" + (index + 1)
                    } else {
                        str += "、请输入标题" + (index + 1)
                    }
                } else if (!item.items.length) {
                    if (str1 === "") {
                        str1 += "请检查以下信息：请选择标题" + (index + 1) + "的题目"
                    } else {
                        str1 += "、请输入标题" + (index + 1) + "的题目"
                    }
                }
            })
            if (str) {
                this.$message.warning(str)
                return false
            }
            if (str1) {
                this.$message.warning(str1)
                return false
            }
            const params = {
                busiCode: "1001",
                tranCode: this.title === "edit" ? "361402" : "361401",
                ...flg
            }

            params.paperItems = JSON.parse(JSON.stringify(this.titleItems))
            params.paperItems.map((item, inx) => {
                const arr = []
                item.items?.flatMap((val, index) => {
                    arr.push({ seq: (index + 1), type: val.topicType, id: val.id })
                })
                item.title = { seq: (inx + 1), name: item.title.name }
                item.items = arr
            })

            params.score = 0
            params.paperType = Number(params.paperType)
            let urlApi = paper.examPaperAdd
            if (this.title === "edit") {
                urlApi = paper.examPaperEdit
            } else {
                delete params.paperCode
            }
            urlApi(params).then(res => {
                if (res.respType === 1) {
                    this.$message.success(this.title === "edit" ? "编辑成功" : "新增成功")
                    this.hideDialog()
                    this.$emit("success")
                }
            })
        },
        // 添加题目
        addQuestion(index) {
            this.titleItemIndex = index
            this.Visible = true
        },
        /**
         * 删除题目
         * @param event 题目的下标
         * @param index 标题的下标
         */
        questionDelete(event, index) {
            const arr = this.titleItems[index].items
            arr.splice(event, 1)
            this.titleItems[index].items = arr
        },
        // 标题新增，titleItems为题目数据
        addTitle() {
            this.titleItems.push({
                title: { name: "" },
                items: []
            })
        },
        // 获取题库
        getBankCode(val) {
            const params = {
                busiCode: "1001",
                tranCode: "361305",
                major: val,
            }
            bank.libSelect(params).then(res => {
                if (res.respType === 1) {
                    const arr = []
                    res.respData?.forEach(item => {
                        arr.push({
                            dictLabel: item.bankName,
                            dictValue: item.bankCode
                        })
                    })
                    this.form.enums.bankCodeList = arr
                }
            })
        },
        // 回调函数
        callBc(item, bind) {
            if (item.bind === "major" && bind) {
                this.getBankCode(bind)
            }
        },
        // 显示隐藏
        showHide(item) {
            // if (item.bind === "paperCode") {
            //     return this.title === "edit"
            // }
            if (item.bind === "bankCode") {
                return this.form.data.paperType
            }
        },
    }
}
</script>

<style lang="scss" scoped>
.examPaper-class {
    display: inline-block;
}
</style>
