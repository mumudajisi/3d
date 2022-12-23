<template>
    <el-dialog
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :title="title === 'edit' ? '编辑题目' : '新增题目'"
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
            <!--试题名称-->
            <div slot="topicName" class="flex">
                <div class="titleBox">
                    <span style="color: #f00;">*</span>
                    试题名称
                </div>
                <div class="Container" @click="slotFocus('topic')" v-html="form.data.topic" />
            </div>
            <!--选项 单选,多选,判断-->
            <div
                v-for="(item,index) in form.enums.optionsList"
                slot="slotSelect"
                :key="index"
                class="slotClass"
            >
                <!--选项-->
                <el-input v-model="item.dictLabel" style="width: 60px" />
                <!--答案-->
                <div
                    class="Container"
                    @click="onInputFocus(index)"
                    v-html="item.content"
                />
                <!--删除-->
                <el-button
                    v-if="form.enums.optionsList.length > 1 && form.data.topicType !== '3'"
                    icon="el-icon-delete" size="mini"
                    style="margin-left: 10px"
                    type="danger"
                    @click="questionItemRemove(index)"
                />
                <!--增加-->
                <el-button
                    v-if="form.data.topicType !== '3'"
                    icon="el-icon-plus"
                    size="mini"
                    style="margin-left: 10px;"
                    type="primary"
                    @click="paperAdd(index)"
                />
            </div>
            <!--填空题答案-->
            <div v-for="(item,index,) in form.enums.fillList" slot="gaping" :key="index" style="margin-bottom: 10px">
                <span style="display:inline-block;width: 40px; text-align: center">{{ item.title }}</span>
                <el-input v-model="item.content" style="width: 74%;margin-right: 10px" />
                <el-input-number v-model="item.score" :min="1" :max="100" :precision="1" :step="1" />
            </div>
            <!--简答答案-->
            <template slot="fillName">
                <div class="Container" @click="slotFocus('correct')" v-html="form.data.correct" />
            </template>

            <!--解析-->
            <div slot="analysis" class="flex">
                <div class="titleBox">
                    解析
                </div>
                <div class="Container" @click="slotFocus('analysis')" v-html="form.data.analysis" />
            </div>
        </BaseForm>
        <!--富文本-->
        <el-dialog v-if="dialogVisible" append-to-body visible @close="cancel">
            <base-tinymce v-model="baseForm" :item="items" />
            <span slot="footer">
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="editorConfirm">确 定</el-button>
            </span>
        </el-dialog>
        <span slot="footer">
            <el-button @click="hideDialog">取 消</el-button>
            <el-button type="primary" @click="submit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import BaseForm from "@/components/BaseFormNew"
import BaseTinymce from "@/components/BaseTinymce"
import { bank, topic } from "@/api"

export default {
    name: "AddOrEdit",
    components: {
        BaseForm,
        BaseTinymce
    },
    props: {
        hideDialog: {
            type: Function,
            default() {
                return () => {}
            }
        },
        title: {
            type: String,
            default: "add"
        },
        row: {
            type: Object,
            default() {
                return null
            }
        },
        radio: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            props: {
                type: {
                    type: Array,
                    default() {
                        return []
                    }
                }
            },
            // 富文本配置
            items: {
                readonly: false, // 是否只读
                placeholder: "请输入富文本",
                height: 300,
                toolbarMode: "sliding",
                data: {
                    busiCode: "1001",
                    tranCode: "100001",
                    roleCode: this.$store.getters["userx/role"].roleKey,
                    loginId: this.$store.getters["userx/id"],
                    fid: 1,
                    dirname: "files/1001/tinymce/exam"
                }
            },
            dialogVisible: false, // 富文本弹框展示
            baseForm: "", // 富文本绑定的值
            tinymceType: "", // 富文本赋值的类型 inputText 一级输入类, optionsText 选项输入类
            labelText: "", // 当前点击选择的字段名称
            optionsIndex: 0, // 单选,多选,判断选中的下标
            form: {
                otherConfig: {
                    labelWidth: "120px"
                },
                config: [
                    // {
                    //     col: 12,
                    //     type: "select",
                    //     name: "专业类别",
                    //     placeholder: "请选择专业类别",
                    //     bind: "major",
                    //     callBc: this.callBc,
                    //     trigger: "change",
                    //     dataList: "majorTypeList",
                    //     required: "请选择专业类别"
                    // },
                    {
                        col: 12,
                        type: "select",
                        name: "题目类型",
                        dataList: "topicTypeList",
                        placeholder: "请选择题目类型",
                        bind: "topicType",
                        trigger: "change",
                        callBc: this.callBc,
                        required: "请选择题目类型"
                    },
                    {
                        col: 12,
                        type: "select",
                        name: "题库名称",
                        placeholder: "请选择题库",
                        bind: "bankCode",
                        dataList: "bankCodeList",
                        trigger: "change",
                        // showHide: this.showHide,
                        required: "请选择题库"
                    },
                    // 试题名称
                    {
                        col: 24,
                        type: "slot",
                        name: "",
                        placeholder: "",
                        slotName: "topicName",
                        bind: "topic"
                    },
                    {
                        col: 24,
                        type: "slot",
                        slotName: "slotSelect",
                        name: "选项",
                        showHide: this.showHide,
                        bind: "options"
                    },
                    {
                        // 解析
                        col: 24,
                        type: "slot",
                        name: "",
                        placeholder: "",
                        slotName: "analysis",
                        bind: "analysis"
                    },
                    {
                        col: 12,
                        type: "switch",
                        name: "是否公开",
                        bind: "openFlag",
                        trigger: "change",
                        showHide: this.showHide,
                        callBc: this.callBc,
                        required: "请选择是否开启"
                    },
                    {
                        col: 12,
                        type: "inputNumber",
                        name: "分数",
                        bind: "score",
                        trigger: "change",
                        required: "请选择分数",
                        controlsPosition: "left",
                        showHide: this.showHide,
                        min: 1,
                        step: 1, // 计数器步长
                        precision: 1 // 精确度
                    },
                    {
                        col: 12,
                        type: "rate",
                        name: "题目难度",
                        bind: "difficult",
                        trigger: "change",
                        required: "请选择难度",
                        max: 5
                    },
                    {
                        col: 24,
                        type: "radio",
                        name: "正确答案", // 单选
                        dataList: "optionsList",
                        bind: "radioCorrect",
                        callBc: this.callBc,
                        showHide: this.showHide,
                        required: "请选择正确答案",
                        trigger: "change"
                    },
                    {
                        col: 24,
                        type: "checkbox",
                        name: "正确答案", // 多选
                        dataList: "optionsList",
                        bind: "checkCorrect",
                        callBc: this.callBc,
                        showHide: this.showHide,
                        required: "请选择正确答案",
                        trigger: "change"
                    },
                    {
                        col: 24,
                        type: "radio",
                        name: "正确答案", // 判断题
                        dataList: "estimateList",
                        bind: "ifCorrect",
                        showHide: this.showHide,
                        callBc: this.callBc,
                        required: "请选择正确答案",
                        trigger: "change"
                    },
                    {
                        col: 24,
                        type: "slot",
                        name: "正确答案", // 填空
                        slotName: "gaping",
                        placeholder: "",
                        showHide: this.showHide,
                        bind: "gaping"
                    },
                    {
                        col: 24,
                        type: "slot",
                        slotName: "fillName",
                        name: "正确答案", // 简答
                        placeholder: "",
                        bind: "fillName",
                        showHide: this.showHide
                    },
                ],
                enums: {
                    // majorTypeList: [], // 专业类别
                    topicTypeList: [], // 题目类型
                    bankCodeList: [], // 题库
                    optionsList: [
                        { dictLabel: "A", dictValue: "A", content: "" },
                        { dictLabel: "B", dictValue: "B", content: "" },
                        { dictLabel: "C", dictValue: "C", content: "" },
                        { dictLabel: "D", dictValue: "D", content: "" }
                    ],
                    estimateList: [
                        { dictLabel: "正确", dictValue: "A", content: "" },
                        { dictLabel: "错误", dictValue: "B", content: "" }
                    ],
                    fillList: []
                },
                data: {
                    major: "0", // 专业
                    topicType: "", // 题目类型
                    bankCode: "", // 题库管理
                    topic: "", // 试题名称
                    correct: "", // 正确答案 单选,多选,判断,简答
                    analysis: "", // 解析
                    score: "", // 分数
                    difficult: 1, // 题目难度
                    openFlag: 1 // switch开关
                }
            }
        }
    },
    mounted() {
        this.getBankCodeList()
        this.form.enums.topicTypeList = this.radio
        if (this.title === "edit") {
            const obj = JSON.parse(JSON.stringify(this.row))
            this.form.data = Object.assign(this.form.data, obj)
            // 处理填空题
            if (obj.topicType === "4") {
                this.form.enums.fillList = JSON.parse(obj.correct)
            }
            if (obj.topicType === "1" || obj.topicType === "2") {
                this.form.data[obj.topicType === "1" ? "radioCorrect" : "checkCorrect"] = obj.topicType === "1" ? obj.correct : JSON.parse(obj.correct)
                this.form.data.correct = obj.topicType === "1" ? obj.correct : JSON.parse(obj.correct)
                this.form.enums.optionsList = JSON.parse(obj.options)
            }
            if (obj.topicType === "3") {
                this.form.enums.estimateList = JSON.parse(obj.options)
                this.form.data.ifCorrect = obj.correct
            }
        }
    },
    methods: {
        // 提交
        async submit() {
            const flg = this.$refs.refForm.validate()
            if (!flg) return false
            const params = {
                busiCode: "1001",
                tranCode: this.title === "edit" ? "361502" : "361501",
                ...flg
            }
            // 单选,多选, 判断
            if (flg.topicType === "1" || flg.topicType === "2" || flg.topicType === "3") {
                params.options = flg.topicType === "3" ? this.form.enums.estimateList : this.form.enums.optionsList
                params.correct = flg.topicType === "2" ? JSON.stringify(params.correct) : params.correct
            } else if (flg.topicType === "4") {
                let score = 0
                this.form.enums.fillList.forEach(item => {
                    score += item.score
                })
                params.score = score
                params.correct = JSON.stringify(this.form.enums.fillList)
            }
            let topicUrl = topic.subjectAdd
            if (this.title === "edit") {
                params.id = this.row.id
                topicUrl = topic.subjectEdit
            }
            await topicUrl(params).then(res => {
                if (res.respType === 1) {
                    this.$message.success(this.title === "add" ? "新增成功" : "编辑成功")
                    this.hideDialog()
                    this.$emit("success")
                }
            })
        },
        // 单选,多选,判断 的选项聚焦事件
        onInputFocus(index) {
            this.tinymceType = "optionsText"
            this.optionsIndex = index
            const str = this.form.data.topicType === "3" ? "estimateList" : "optionsList"
            this.baseForm = this.form.enums[str][index].content
            this.dialogVisible = true
        },
        // 选项类聚焦事件
        slotFocus(labelText) {
            this.tinymceType = "inputText"
            this.labelText = labelText
            this.baseForm = this.form.data[labelText]
            this.dialogVisible = true
        },

        // 富文本确定
        editorConfirm() {
            // 填空题开始 正则判断是否存在,返回一个数组
            if (this.form.data.topicType === "4" && this.labelText === "topic") {
                const arr = []
                const spanRegex = new RegExp('<span class="gapFilling">(.*?)<\\/span>', "g")
                const gapFillingItems = this.baseForm.match(spanRegex)
                if (gapFillingItems === null) {
                    this.$message.error("请插入填空")
                    return false
                } else {
                    gapFillingItems?.forEach(span => {
                        const pairRegex = /<span class="gapFilling">(.*?)<\/span>/
                        pairRegex.test(span)
                        arr.push({
                            title: RegExp.$1,
                            content: "",
                            score: 0
                        })
                    })
                    this.form.enums.fillList = arr.sort((a, b) => { return +a.title - +b.title })
                }
                // 填空题结束
            }
            if (this.baseForm !== "") {
                // 一级输入类
                if (this.tinymceType === "inputText") {
                    this.form.data[this.labelText] = this.baseForm // 富文本赋值
                } else if (this.tinymceType === "optionsText") {
                    // 选项输入类
                    const str = this.form.data.topicType === "3" ? "estimateList" : "optionsList"
                    this.form.enums[str][this.optionsIndex].content = this.baseForm
                }
                this.dialogVisible = false
            } else {
                this.$message({
                    type: "warning",
                    message: "请输入内容"
                })
            }
        },

        // 富文本取消
        cancel() {
            this.dialogVisible = false
            this.baseForm = ""
        },
        // 新增选项
        paperAdd() {
            let newLastPrefix
            if (this.form.enums.optionsList.length > 0) {
                const last = this.form.enums.optionsList[this.form.enums.optionsList.length - 1]
                newLastPrefix = String.fromCharCode(last.dictLabel.charCodeAt() + 1)
            } else {
                newLastPrefix = "A"
            }
            this.form.enums.optionsList.push({ dictLabel: newLastPrefix, dictValue: newLastPrefix, content: "" })
        },
        // 删除题选项
        questionItemRemove(index) {
            this.form.enums.optionsList.splice(index, 1)
        },

        // 获取题库
        async getBankCodeList() {
            const params = {
                busiCode: "1001",
                tranCode: "361305",
            }
            await bank.libSelect(params).then(res => {
                const arr = []
                if (res.respType === 1) {
                    res.respData.forEach(item => {
                        arr.push({
                            dictLabel: item.bankName,
                            dictValue: item.bankCode
                        })
                    })
                    this.form.enums.bankCodeList = arr
                }
            })
        },
        callBc(item, bind) {
            if (
                item.bind === "radioCorrect" ||
                item.bind === "checkCorrect" ||
                item.bind === "ifCorrect" ||
                item.bind === "fillName"
            ) {
                this.form.data.correct = bind
            }
        },
        // 控制显示隐藏
        showHide(item) {
            if (item.bind === "bankCode") { // 题库展示
                return this.form.data.major
            } else if (item.bind === "options") { // 单选,多选,判断展示选项
                return this.form.data.topicType === "1" || this.form.data.topicType === "2"
            } else if (item.bind === "score") {
                return this.form.data.topicType !== "4"
            } else if (item.bind === "radioCorrect") {
                return this.form.data.topicType === "1"
            } else if (item.bind === "checkCorrect") {
                return this.form.data.topicType === "2"
            } else if (item.bind === "ifCorrect") {
                return this.form.data.topicType === "3"
            } else if (item.bind === "gaping") {
                return this.form.data.topicType === "4" && this.form.enums.fillList.length
            } else if (item.bind === "fillName") {
                return this.form.data.topicType === "5"
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.slotClass {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.titleBox {
    width: 66px;
    margin-left:-80px;
    font-weight:700;
    text-align: right;
}

.Container {
    width: 100%;
    min-height: 30px;
    border: 1px solid #ccc;
    margin-left: 14px;
    border-radius: 3px;
    overflow: hidden;

    ::v-deep p {
        margin: 0;
        text-indent: 10px;
    }
}

</style>
