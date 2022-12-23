<template>
    <div class="app-container">
        <el-row v-if="dataList" :gutter="24">
            <el-col :span="4">
                <el-card class="box-card">
                    <div>
                        <div>{{ dataList.paperName }}</div>
                        <div class="times">
                            <div>总分：{{ dataList.score }}分</div>
                            <div>时长：{{ platExamInfo.examTimes }}分钟</div>
                        </div>
                    </div>
                    <el-divider />
                    <div>
                        <div style="text-align: center">剩余时间</div>
                        <div style="color: red;text-align: center" class="mt10">{{ remainTime }}</div>
                    </div>
                    <el-divider />
                    <div class="lastTime" style="text-align: center">
                        <el-button type="primary" @click="submit">提交试卷</el-button>
                    </div>
                    <el-divider />
                    <div class="tags">
                        <el-tag
                            v-for="(item,index) in answer"
                            :key="index"
                            :type="item.type"
                            @click="goAnchor('#question-'+item.seq)"
                        >
                            {{ item.seq }}
                        </el-tag>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="20">
                <el-card class="box-card">
                    <div v-for="(item, index) in dataList.topics" :key="index">
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
                                        v-model="val.correct"
                                        :label="op.dictValue"
                                        @change="changeType(val)"
                                    >
                                        <span>{{ op.dictLabel }}. </span>
                                        <span v-html="op.content" />
                                    </el-radio>
                                </div>
                                <!--多选-->
                                <div v-else-if="val.topicType === '2'">
                                    <el-checkbox-group v-model="val.correct">
                                        <el-checkbox v-for="(op, i) in val.options" :key="i" :label="op.dictValue" @change="changeType(val)">
                                            <span>{{ op.dictLabel }}. </span>
                                            <span v-html="op.content" />
                                        </el-checkbox>
                                    </el-checkbox-group>
                                </div>
                                <!--填空-->
                                <div v-else-if="val.topicType === '4'">
                                    <div v-for="(op, i) in val.correct" :key="i" class="mb10" @click="changeType(val)">
                                        <span>{{ op.title }}.</span>
                                        <div class="editor" @click="editor('4', op.content, index, inx, i)" v-html="op.content" />
                                    </div>
                                </div>
                                <!--简答-->
                                <div v-else-if="val.topicType === '5'" @click="changeType(val)">
                                    <div class="editor" @click="editor('5', val.correct, index, inx)" v-html="val.correct" />
                                </div>
                                <el-divider />
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <!--富文本-->
        <el-dialog v-if="dialogVisible" append-to-body visible @close="dialogVisible = false">
            <base-tinymce v-model="tinymceData" />
            <span slot="footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editorConfirm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import BaseTinymce from "@/components/BaseTinymce"
import { exam } from "@/api"
export default {
    components: { BaseTinymce },
    data() {
        return {
            dataList: null, // 题目信息
            platExamInfo: null, // 考试信息
            platExamUser: null, // 考生信息
            answer: [], // 题目的数据
            dialogVisible: false,
            tinymceData: "", // 富文本内容
            topicType: null, // 题目类型4填空 5简答
            topicsIndex: 0, // 大分类的下标
            itemsIndex: 0, // 小分类的下标
            correctIndex: 0, // 填空的下标
            remainTime: 0, // 倒计时时间
            timer: null
        }
    },
    mounted() {
        this.getList()
    },
    methods: {
        submit() {
            const params = {
                busiCode: 1001,
                tranCode: 361701,
                examId: this.platExamInfo.id,
                examName: this.platExamInfo.examName,
                paperCode: this.platExamInfo.paperCode,
                major: this.dataList.major,
                examTime: this.platExamUser.examTime,
                answer: []
            }
            this.dataList.topics.forEach(item => {
                item.items.forEach(val => {
                    let correct = null
                    if (val.topicType === "4") {
                        const arr = {}
                        val.correct.forEach(op => {
                            arr[op.title] = op.content
                        })
                        correct = arr
                    } else if (val.topicType === "2") {
                        correct = this.alphaNumericSort(val.correct)
                    } else {
                        correct = val.correct
                    }
                    params.answer.push({
                        answer: correct,
                        titleNo: val.titleNo,
                        topic: val.topic,
                        topicId: val.id,
                        topicNo: val.topicNo,
                        topicScore: val.score,
                        topicType: val.topicType
                    })
                })
            })
            exam.examAnswerAdd(params).then(res => {
                if (res.respType === 1) {
                    this.$bus.$emit("refreshExamList")
                    this.$message.success("提交成功")
                    this.$eventBus.emit("startAppendExam")
                    clearInterval(this.timer)
                    this.back()
                }
            })
        },
        countdowm(timestamp) {
            const self = this;
            this.timer = setInterval(function () {
                const nowTime = new Date();
                const endTime = new Date(timestamp);
                const t = endTime.getTime() - nowTime.getTime();
                if (t > 0) {
                    const day = Math.floor(t / 86400000);
                    let hour = Math.floor((t / 3600000) % 24);
                    let min = Math.floor((t / 60000) % 60);
                    let sec = Math.floor((t / 1000) % 60);
                    hour = hour < 10 ? "0" + hour : hour;
                    min = min < 10 ? "0" + min : min;
                    sec = sec < 10 ? "0" + sec : sec;
                    let format = "";
                    if (day > 0) {
                        format = `${day}天${hour}小时${min}分${sec}秒`;
                    }
                    if (day <= 0 && hour > 0) {
                        format = `${hour}小时${min}分${sec}秒`;
                    }
                    if (day <= 0 && hour <= 0) {
                        format = `${min}分${sec}秒`;
                    }
                    self.remainTime = format;
                } else {
                    self.submit()
                    clearInterval(this.timer);
                }
            }, 1000);
        },
        // 关闭当前页面返回上一个页面
        back() {
            this.$store.state.userx.tagViews.splice(this.$store.state.userx.tagViews.findIndex(item => item.path === this.$route.path), 1)
            this.$router.go(-1)
        },
        // 点击题目之后改变tag标签
        changeType(val) {
            this.answer.map(item => {
                if (item.id === val.id) {
                    item.type = "success"
                }
            })
        },
        // 根据字母大小排序
        alphaNumericSort(arr = []) {
            return arr.sort((a, b) => {
                return a.toLowerCase().localeCompare(b.toLowerCase())
            })
        },
        // 点击打开富文本
        editor(type, content, index, inx, i) {
            this.tinymceData = content // 给富文本赋值
            this.topicType = type // 题目类型
            this.topicsIndex = index // 大分类的下标
            this.itemsIndex = inx // 小分类的下标
            this.correctIndex = i // 题目的下标
            this.dialogVisible = true
        },
        // 点击富文本确定
        editorConfirm() {
            this.dialogVisible = false
            if (this.topicType === "4") {
                this.dataList.topics[this.topicsIndex].items[this.itemsIndex].correct[this.correctIndex].content = this.tinymceData
            } else if (this.topicType === "5") {
                this.dataList.topics[this.topicsIndex].items[this.itemsIndex].correct = this.tinymceData
            }
        },
        // 跳转到指定的位置
        goAnchor(selector) {
            this.$el.querySelector(selector).scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" })
        },
        getList() {
            if (!this.$route.query.id) return false
            const params = {
                busiCode: 1001,
                tranCode: 361807,
                examId: Number(this.$route.query.id)
            }
            exam.examUserStart(params).then(res => {
                if (res.respType === 1) {
                    const arr = []
                    res.respData?.platExamPaper?.topics?.map(item => {
                        item.items.map(val => {
                            val.type = "info"
                            if (val.topicType === "1" || val.topicType === "2" || val.topicType === "3") {
                                val.correct = val.topicType === "2" ? [] : ""
                                val.options = JSON.parse(val.options)
                            } else if (val.topicType === "4") {
                                const arr1 = []
                                const spanRegex = new RegExp('<span class="gapFilling">(.*?)<\\/span>', "g")
                                const gapFillingItems = val.topic.match(spanRegex)
                                gapFillingItems?.forEach(span => {
                                    const pairRegex = /<span class="gapFilling">(.*?)<\/span>/
                                    pairRegex.test(span)
                                    arr1.push({
                                        title: RegExp.$1,
                                        content: ""
                                    })
                                })
                                val.correct = arr1
                            } else if (val.topicType === "5") {
                                val.correct = ""
                            }
                            arr.push(val)
                        })
                    })
                    this.answer = arr
                    this.dataList = res.respData?.platExamPaper // 题目的信息
                    this.platExamInfo = res.respData?.platExamInfo // 考试信息
                    this.platExamUser = res.respData?.platExamUser // 考生的信息
                    this.countdowm(res.respData.platExamInfo.deadline)
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.box-card {
    height: calc(100vh - 115px);
    overflow: auto;
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
.title {
    font-size: 18px;
    padding: 18px 20px;
    margin-bottom: 20px;
    background: #fafafa;
    text-align: left;
    border-top: 1px solid #dedede;
    border-bottom: 1px solid #dedede;
}
.times {
    display: flex;
    font-size: 14px;
    margin-top: 20px;
    justify-content: space-between;
    flex-wrap: wrap;
}

::v-deep p {
    margin: 0;
    display: inline-block;
}

.editor {
    display: inline-block;
    border-bottom: 1px solid #ff0000;
    cursor: pointer;
    min-width: 80px;
    min-height: 30px;
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
