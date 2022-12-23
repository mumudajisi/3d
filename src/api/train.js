import http from "@/utils/http";
export default {
    // 培训管理新增
    infoAdd(params) {
        return http.post("/train/info/add", params)
    },
    //    编辑培训管理
    infoEdit(params) {
        return http.post("/train/info/edit", params)
    },
    // 分页查询
    infoPage(params) {
        return http.post("/train/info/page", params)
    },
    // 删除培训
    infoDelete(params) {
        return http.post("/train/info/delete", params)
    },
    // 报名
    userAdd(params) {
        return http.post("/train/user/add", params)
    },
    //    学员查询
    userPage(params) {
        return http.post("/train/user/page", params)
    },
    // 获取培训详细信息
    trainInfoQuery(params) {
        return http.post("/train/info/query", params)
    },
    // 培训资源新增
    trainRsAdd(params) {
        return http.post("/train/rs/add", params)
    },
    // 培训资源编辑
    trainRsEdit(params) {
        return http.post("/train/rs/edit", params)
    },
    // 根据类型查询课程资源
    trainQueryTypes(params) {
        return http.post("train/rs/types", params)
    },
    // 删除培训资源
    trainRsDelete(params) {
        return http.post("/train/rs/delete", params)
    },
    // 更新用户学习状态
    trainUserLearned(params) {
        return http.post("/train/user/learned", params)
    },
    // 批量报名
    examUserBatchAdd(params) {
        return http.post("/exam/user/batch/add", params)
    },
    mgrQueryUser(params) {
        return http.post("/exam/mgr/query/user", params)
    },
};
