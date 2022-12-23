import { httpExam } from "@/utils/http"

export default {
    // 分页查询试卷信息
    examPaperPage(params) {
        return httpExam.post("/exam/paper/page", params);
    },
    // 不分页查询
    examPaperSelect(params) {
        return httpExam.post("/exam/paper/select", params);
    },
    // 新增试卷信息
    examPaperAdd(params) {
        return httpExam.post("/exam/paper/add", params);
    },
    // 编辑试卷信息
    examPaperEdit(params) {
        return httpExam.post("/exam/paper/edit", params);
    },
    // 删除试卷
    examPaperDelete(params) {
        return httpExam.post("/exam/paper/delete", params);
    },
}
