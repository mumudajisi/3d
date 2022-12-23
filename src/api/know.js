import http from "@/utils/http";

export default {
    getKnowList(params) {
        return http.post("/know/type/query", {
            ...params,
            busiCode: "1002",
            tranCode: "361303",
        });
    },
    addKnow(params) {
        return http.post("/know/type/add", {
            ...params,
            busiCode: "1002",
            tranCode: "361301",
        });
    },
    updateKnow(params) {
        return http.post("/know/type/edit", {
            ...params,
            busiCode: "1002",
            tranCode: "361302",
        });
    },
    deleteKnows(params) {
        return http.post("/know/type/delete", {
            ...params,
            busiCode: "1002",
            tranCode: "361304",
        });
    },
    getKnowDataList(params) {
        return http.post("/know/data/query", {
            ...params,
            busiCode: "1002",
            tranCode: "361403",
        });
    },
    addKnowData(params) {
        return http.post("/know/data/add", {
            ...params,
            busiCode: "1002",
            tranCode: "361401",
        });
    },
    updateKnowData(params) {
        return http.post("/know/data/edit", {
            ...params,
            busiCode: "1002",
            tranCode: "361402",
        });
    },
    deleteKnowsData(params) {
        return http.post("/know/data/delete", {
            ...params,
            busiCode: "1002",
            tranCode: "361404",
        });
    },
    getTypeTree() {
        return http.post("/know/type/tree", {
            busiCode: "1002",
            tranCode: "361307",
        });
    },
    // 用户端接口
    getList(params) {
        return http.post("/web/know/index", {
            busiCode: "1002",
            tranCode: "361400",
            ...params,
        });
    },
    getTree() {
        return http.post("/web/know/tree", {
            busiCode: "1002",
            tranCode: "361409",
        });
    },
    // 关联词条
    knowLink() {
        return http.post("/web/know/link", {
            busiCode: "1002",
            tranCode: "361410",
        });
    },
    // 词条查询详情
    knowDetail(params) {
        return http.post("/web/know/detail", {
            busiCode: "1002",
            tranCode: "361412",
            ...params
        });
    },

    // 查询词条代码集合
    knowDataQueryCodes(params) {
        return http.post("/know/data/query/codes", params)
    },
    // 查询模型代码集合
    modelTypeQueryCodes(params) {
        return http.post("/model/type/query/codes", params)
    },
    // 查询词条详情
    knowDataQueryDetail(params) {
        return http.post("/know/data/query/detail", params)
    }
};
