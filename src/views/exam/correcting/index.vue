<template>
    <div class="app-container">
        <el-row :gutter="24">
            <el-col :span="4">
                <el-card class="box-card">
                    <div>
                        <div>{{ titleList.examName }}</div>
                        <div class="times">
                            <div style="margin-top: 10px">得分{{ titleList.score }}/{{ answerList.score }}分</div>
                            <div style="margin-top: 10px"> 用时:{{ titleList.examCost }}</div>
                        </div>
                    </div>
                    <el-divider />
                    <div class="tags">
                        <el-tag v-for="(val, inx) in answerObj" :key="inx" :type="(val.examScore===val.score?'success':(val.examScore<val.score&&val.examScore>0?'warning':'danger'))" @click="goAnchor('#question-'+val.seq)">{{ val.seq }}</el-tag>
                    </div>
                    <el-divider />
                    <div class="lastTime" style="text-align: center">
                        <el-button type="primary" @click="submit()">提交批改</el-button>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="20"><div class="grid-content bg-purple" />
                <el-card class="box-card">
                    <div v-for="(item, index) in answerList.topics" :key="index">
                        <div class="title">{{ item.title.name }}</div>
                        <div v-for="(val, inx) in item.items" :id="'question-'+ val.seq" :key="inx" class="flex">
                            <div style="font-size: 20px;">{{ val.seq }}.</div>
                            <div class="width-100">
                                <div class="mb-20" v-html="val.topic" />
                                <!--单选,判断-->
                                <div v-if="val.topicType === '1' || val.topicType === '3'">
                                    <el-radio
                                        v-for="(op, i) in val.options"
                                        :key="i"
                                        v-model="val.answer"
                                        :disabled="disabled"
                                        :label="op.dictValue"
                                    >
                                        <span>{{ op.dictLabel }}.</span>
                                        <span v-html="op.content" />
                                    </el-radio>
                                    <div class="result">
                                        <div>题目分数:{{ val.score }}</div>
                                        <div class="student">
                                            <div>学生分数:{{ val.examScore }}</div>
                                            <div><span style="color: orange;margin-left: 10px">批改:</span>  <el-input-number v-model="val.examScore" :step="val.score" :max="val.score" :min="0" /></div>
                                        </div>
                                        <div v-if="val.topicType==='1'">正确答案:{{ val.correct }}</div>
                                        <div v-if="val.topicType==='3'">正确答案：{{ val.correct==='A'?'正确':'错误' }}</div>
                                        <div v-if="val.analysis">
                                            <span>解析:</span>
                                            <span v-html="val.analysis" />
                                        </div>
                                    </div>
                                </div>
                                <!--多选题-->
                                <div v-else-if="val.topicType === '2'">
                                    <el-checkbox-group v-model="val.answer" :disabled="disabled">
                                        <el-checkbox
                                            v-for="(op,i) in val.options" :key="i" :label="op.dictValue"
                                        >
                                            <span>{{ op.dictLabel }}:</span>
                                            <span v-html="op.content" />
                                        </el-checkbox>
                                    </el-checkbox-group>
                                    <div class="result">
                                        <div>题目分数:{{ val.score }}</div>
                                        <div class="student">
                                            <div>学生分数:{{ val.examScore }}</div>
                                            <div><span style="color: orange;margin-left: 10px">批改:</span>  <el-input-number v-model="val.examScore" :step="1" :max="val.score" :min="0" /></div>
                                        </div>
                                        <div>
                                            <span>正确答案：</span>
                                            <span v-for="(item,index) in val.correct" :key="index">{{ item }},</span>
                                        </div>
                                        <div v-if="val.analysis">
                                            <span>解析:</span>
                                            <span v-html="val.analysis" />
                                        </div>
                                    </div>
                                </div>
                                <!-- 填空题-->
                                <div v-else-if="val.topicType==='4'">
                                    <div v-for="(op, i) in val.answer" :key="i" class="mb10">
                                        <span>{{ op.title }}.</span>
                                        <div class="editor" :disabled="disabled" v-html="op.answer" />
                                    </div>
                                    <div class="result">
                                        <div>题目分数:{{ val.score }}</div>
                                        <div class="student">
                                            <div>学生分数:{{ val.examScore }}</div>
                                            <div><span style="color: orange;margin-left: 10px">批改:</span>  <el-input-number v-model="val.examScore" :step="1" :max="val.score" :min="0" /></div>
                                        </div>
                                        <div>
                                            <span>正确答案:</span>
                                            <span v-for="(item,index) in val.correct" :key="index">{{ item.content }},</span>
                                        </div>
                                        <div v-if="val.analysis">
                                            <span>解析:</span>
                                            <span v-html="val.analysis" />
                                        </div>
                                    </div>
                                </div>
                                <!-- 简答题 -->
                                <div v-else-if="val.topicType==='5'">
                                    <span class="editor" :disabled="disabled" v-html="val.answer" />
                                    <div class="result">
                                        <div>题目分数:{{ val.score }}</div>
                                        <div class="student">
                                            <div>学生分数:{{ val.examScore }}</div>
                                            <div><span style="color: orange;margin-left: 10px">批改:</span>  <el-input-number v-model="val.examScore" :step="1" :max="val.score" :min="0" /></div>
                                        </div>
                                        <div>
                                            <span>正确答案:</span>
                                            <span v-html="val.correct" />
                                        </div>
                                        <div v-if="val.analysis">
                                            <span>解析:</span>
                                            <span v-html="val.analysis" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import correctApi from "@/api/correct"
import moment from "moment";
export default {
    name: "CorrectIndex",
    filters: {
    },
    data() {
        return {
            titleList: [],
            answerList: [],
            sum: "", //, 计算总分
            answerObj: [],
            answers: [],
            typeInfo: "success", // 状态
            topicType: null,
            disabled: true
        }
    },
    watch: {
        "$route.query.exams": {
            handler() {
                if (this.$route.path !== "/exam/correcting") return false
                this.correctList()
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        // 查询答案
        async correctList() {
            const params = {
                busiCode: "1001",
                tranCode: 361705,
                userId: this.$route.query.name, // id
                examId: Number(this.$route.query.exams)// 考试id
            }
            await correctApi.answerSelect(params).then(res => {
                if (res.respType === 1) {
                    const objArr = []
                    res.respData.platExamPaper?.topics?.map(item => {
                        item.items.map(val => {
                            if (val.topicType === "1" || val.topicType === "2" || val.topicType === "3") {
                                val.options = JSON.parse(val.options)
                                val.answer = val.topicType === "2" ? JSON.parse(val.answer) : val.answer
                                val.correct = val.topicType === "2" ? JSON.parse(val.correct) : val.correct;
                            } else if (val.topicType === "4") {
                                val.answer = JSON.parse(val.answer)
                                const arr = []
                                for (const i in val.answer) {
                                    arr.push({
                                        title: i,
                                        answer: val.answer[i]
                                    })
                                }
                                val.answer = arr
                                val.correct = JSON.parse(val.correct)
                            }
                            objArr.push(val)
                        })
                    })
                    this.answerObj = objArr
                    this.answerList = res.respData.platExamPaper;
                    this.titleList = res.respData.platExamUser; // 用户
                    this.titleList.examCost = moment.utc(this.titleList.examCost * 1000).format("mm分ss秒")
                }
            })
        },
        // 批改试卷
        async submit() {
            const arr = []
            this.answerList.topics.forEach(item => {
                item.items.forEach(val => {
                    arr.push({
                        id: val.answerId,
                        topicId: val.id,
                        score: val.examScore
                    })
                })
                this.answers = arr
            })
            const params = {
                busiCode: "1001",
                examId: Number(this.$route.query.exams),
                tranCode: "361706",
                answer: this.answers,
                userId: this.$route.query.name,
            };
            await correctApi.answerCorrect(params).then(res => {
                if (res.respType === 1) {
                    this.$message({
                        message: "批改成功",
                        type: "success"
                    });
                }
            })
            await this.$router.push({
                path: "/exam/exam",
            })
        },
        // 跳转到指定的位置
        goAnchor(selector) {
            this.$el.querySelector(selector).scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" })
        },
    }
}
</script>

<style lang="scss" scoped>
.box-card{
    height: calc(100vh - 115px);
    overflow: auto;
}
.tag{
    display: flex;
}
.tag-wraper{
    display: flex;
    width: 100%;
    flex-wrap: nowrap;
}
::v-deep p {
    margin: 0;
    display: inline-block;
}
.result{
    margin-top: 20px;
    line-height: 30px;
    margin-bottom: 15px;
}
.student{
    display: flex;
    align-items: center;
}
.title {
    font-size: 18px;
    padding: 18px 20px;
    margin-bottom: 20px;
    background: #fafafa;
    text-align: left;
    border-top: 1px solid #dedede;
    border-bottom: 1px solid #dedede;
}
.editor {
    display: inline-block;
    border-bottom: 1px solid #ff0000;
    cursor: pointer;
    min-width: 80px;
}
.el-checkbox{
    margin-bottom: 10px;
}
.el-checkbox-group{
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    margin-top: 5px;
}
::v-deep .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner,
::v-deep .el-radio__input.is-disabled.is-checked .el-radio__inner
{
    background-color: #1890ff !important;
    border-color: #1890ff !important;
}
::v-deep .el-radio__input.is-disabled.is-checked .el-radio__inner::after,
{
    background-color: #fff;
}
::v-deep .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
    border-color: #fff;
}
.tags{
    display: flex;
    flex-wrap: wrap;
    cursor: pointer;
    .el-tag{
        width: 25px;
        height: 25px;
        margin: 5px 1px 1px 5px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

</style>
