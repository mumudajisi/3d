import { httpExam } from "@/utils/http"

export default {
    // 新增题库
    libAdd(params) {
        return httpExam.post("/exam/lib/add", params);
    },
    // 编辑题库
    libEdit(params) {
        return httpExam.post("/exam/lib/edit", params);
    },
    // 删除题库
    libDelete(params) {
        return httpExam.post("/exam/lib/delete", params)
    },
    // 查询
    libPage(params) {
        return httpExam.post("/exam/lib/page", params);
    },
    // 不分页查询
    libSelect(params) {
        return httpExam.post("/exam/lib/select", params);
    },
    //    区域
    areaTree(params) {
        return httpExam.post("/area/tree", params);
    },

}
