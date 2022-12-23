import { httpExam } from "@/utils/http"

export default {
    // 新增题目
    subjectAdd(params) {
        return httpExam.post("/exam/subject/add", params);
    },
    //    编辑题目
    subjectEdit(params) {
        return httpExam.post("/exam/subject/edit", params);
    },
    // 删除题目
    subjectDelete(params) {
        return httpExam.post("/exam/subject/delete", params);
    },
    //    查询
    subjectPage(params) {
        return httpExam.post("/exam/subject/page", params);
    },
}
