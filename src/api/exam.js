import { httpExam } from "@/utils/http"

export default {
    // 新增考试
    mgrAdd(params) {
        return httpExam.post("/exam/mgr/add", params);
    },
    //    编辑考试
    mgrEdit(params) {
        return httpExam.post("/exam/mgr/edit", params);
    },
    // 删除考试
    mrgDelete(params) {
        return httpExam.post("/exam/mgr/delete", params)
    },
    //    分页查询
    mrgPage(params) {
        return httpExam.post("/exam/mgr/page", params)
    },
    // 开始考试的接口查询试卷
    examUserStart(params) {
        return httpExam.post("/exam/user/start", params)
    },
    // 提交考试答案
    examAnswerAdd(params) {
        return httpExam.post("/exam/answer/add", params)
    }
}
