import { httpExam } from "@/utils/http"

export default {
    integralAdd(params) {
        return httpExam.post("/integral/add", params)
    },
    // 积分分页
    integralQuery(params) {
        return httpExam.post("/integral/query", params)
    },
    //    积分查询
    integralUserScore(params) {
        return httpExam.post("/integral/user/score", params)
    },
}
