import { httpExam } from "@/utils/http"

export default {
    // 删除考试
    userDelete(params) {
        return httpExam.post("/exam/user/delete", params)
    },
    //    分页查询
    userPage(params) {
        return httpExam.post("/exam/user/page", params)
    },
    //    报名
    userAdd(params) {
        return httpExam.post("/exam/user/add", params)
    },
    //    我的考试
    myExam(params) {
        return httpExam.post("/exam/user/my/exam", params)
    },
}
