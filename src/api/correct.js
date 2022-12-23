import { httpExam } from "@/utils/http"

export default {
    // 查询答案
    answerSelect(params) {
        return httpExam.post("/exam/answer/select", params);
    },
    // 批改试卷
    answerCorrect(params) {
        return httpExam.post("/exam/answer/correct", params);
    },
}
