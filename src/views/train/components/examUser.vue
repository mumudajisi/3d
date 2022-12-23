<template>
    <div class="app-container">
        <BaseTable
            :table-data="table.data"
            :table-config="table.config"
            :other-config="table.otherConfig"
            @selected="selected"
        />
        <addOrEditExam
            v-if="dialogVisible"
            :title="title"
            :row="row"
            :train-code="trainCode"
            :train-name="trainName"
            :hide-dialog="() => (dialogVisible = false)"
            @success="getList"
        />
    </div>
</template>

<script>
import BaseTable from "@/components/BaseTableNew"
import addOrEditExam from "@/views/train/components/addOrEditExam";
import mgrApi from "@/api/exam"
import { train } from "@/api";
export default {
    name: "ExamIndex",
    components: {
        BaseTable,
        addOrEditExam
    },
    props: {
        trainCode: {
            type: [String, Number],
            default: ""
        },
        trainName: {
            type: String,
            default: ""
        },
        isLearned: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            title: "add",
            row: null,
            selectList: [],
            dialogVisible: false,
            table: {
                data: [],
                config: {
                    header: [
                        {
                            type: "text",
                            prop: "examName",
                            name: "考试名称",
                        },
                        {
                            type: "text",
                            prop: "examTimes",
                            name: "考试时长",
                            width: 100
                        },
                        {
                            type: "text",
                            prop: "score",
                            name: "分数",
                            width: 100
                        },
                        {
                            type: "text",
                            prop: "examTime",
                            name: "考试开始时间",
                            width: 180
                        },
                        {
                            type: "text",
                            prop: "deadline",
                            width: 180,
                            name: "考试结束时间"
                        },
                    ],
                    outerBtn: [
                        {
                            name: "新增",
                            method: "add",
                            icon: "el-icon-plus",
                            code: "exam/add",
                        },
                        {
                            name: "批量删除",
                            method: "deleteChoose",
                            icon: "el-icon-delete",
                            code: "exam/delete",
                            type: "danger"
                        }
                    ],
                    innerBtn: [
                        {
                            name: "编辑",
                            method: "edit",
                            icon: "el-icon-edit",
                            code: "exam/edit",
                        },
                        {
                            name: "删除",
                            method: "delete",
                            icon: "el-icon-delete",
                            code: "exam/delete",
                        },
                        {
                            name: "考试",
                            method: "exam",
                            icon: "el-icon-mouse",
                            code: "exam/detail/exams",
                            validate: (item, row) => { return this.isLearned && !row.score }
                        },
                        {
                            name: "查看答案",
                            method: "answer",
                            icon: "el-icon-s-claim",
                            validate: this.innerBtnShow,
                            bind: "answer",
                            code: "exam/detail/result",
                        },
                        {
                            name: "考生",
                            method: "examine",
                            icon: "el-icon-user",
                            code: "exam/student",
                        },
                    ]
                },
                otherConfig: {
                    innerBtnWidth: 300,
                    btnAlign: "right",
                    rowKey: "id", // 行数据的 Key
                    selection: true, // 是否展示多选
                    index: "序号" // 是否显示序号
                },
            }
        }
    },
    mounted() {
        // this.getList()
    },
    methods: {
        // 自动报名
        enrolls(list) {
            if (list.length) {
                const params = {
                    busiCode: 1002,
                    tranCode: 361808,
                    list
                }
                train.examUserBatchAdd(params)
            }
        },
        // 按钮显示隐藏
        innerBtnShow(item, row) {
            if (item.bind === "answer") {
                return row.score
            }
        },
        // 开始考试
        exam(row) {
            const nowDate = new Date().getTime()
            const startDate = new Date(row.examTime).getTime()
            const endDate = new Date(row.deadline).getTime()
            if (nowDate >= startDate && nowDate <= endDate) {
                this.$router.push({
                    path: "/student/examList/appendExam",
                    query: {
                        id: row.id,
                        examName: row.examName
                    }
                })
            } else {
                this.$message.warning("不在考试时间内")
            }
        },
        // 查看答案
        answer(row) {
            this.$router.push({
                path: "/student/examList/result",
                query: {
                    exams: row.id,
                }
            })
        },
        // 按钮的方法
        add() {
            this.title = "add"
            this.dialogVisible = true
        },
        // 编辑
        edit(row) {
            this.title = "edit"
            this.dialogVisible = true
            this.row = row ? Object.assign(row) : row
        },
        // 删除
        delete(row, fn) {
            this.$confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除考试序号为" + row.id) + "的考试", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(async () => {
                const params = {
                    busiCode: 1001,
                    ids: typeof fn === "function" ? row : [row.id],
                    tranCode: "361604",
                };
                await mgrApi.mrgDelete(params).then((res) => {
                    if (res.respType === 1) {
                        this.$message({
                            type: "success",
                            message: "删除成功!",
                        });
                        if (typeof fn === "function") {
                            fn()
                        }
                        this.getList();
                    }
                });
            });
        },
        // 多选框的返回数据
        selected(value) {
            this.selectList = value
        },
        // 批量删除
        deleteChoose() {
            if (this.selectList.length <= 0) {
                this.$message({
                    type: "warning",
                    message: "请先选择删除的数据",
                });
                return false
            }
            const ids = this.selectList.map((item) => item.id)
            this.delete(ids, () => {
                this.selectList = []
            })
        },
        // 考生
        examine(row) {
            const exams = row.id
            this.$router.push({
                path: "/exam/examine",
                query: {
                    exams
                }
            })
        },
        // 获取列表数据
        async getList() {
            const pageData = {
                busiCode: "1001",
                tranCode: "361609",
                linkResource: this.trainCode,
                userName: this.$store.getters["userx/name"],
            };
            await train.mgrQueryUser(pageData).then(res => {
                if (res.respType === 1) {
                    res.respData.examList.forEach(item => {
                        if (item.score !== undefined) {
                            item.score = String(item.score)
                        }
                    })
                    this.table.data = res.respData.examList;
                    this.enrolls(res.respData.unsignList)
                }
            })
        },
    }
}
</script>

<style lang="scss" scoped></style>
