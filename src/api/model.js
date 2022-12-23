import http from "@/utils/http";

export default {
    getModelList(params) {
        return http.post("/model/type/query", {
            ...params,
            busiCode: "1002",
            tranCode: "361503",
        });
    },
    addModel(params) {
        return http.post("/model/type/add", {
            ...params,
            busiCode: "1002",
            tranCode: "361501",
        });
    },
    updateModel(params) {
        return http.post("/model/type/edit", {
            ...params,
            busiCode: "1002",
            tranCode: "361502",
        });
    },
    deleteModels(params) {
        return http.post("/model/type/delete", {
            ...params,
            busiCode: "1002",
            tranCode: "361504",
        });
    },
    getModelDataList(params) {
        return http.post("/model/data/query", {
            ...params,
            busiCode: "1002",
            tranCode: "361603",
        });
    },
    addModelData(params) {
        return http.post("/model/data/add", {
            ...params,
            busiCode: "1002",
            tranCode: "361601",
        });
    },
    updateModelData(params) {
        return http.post("/model/data/edit", {
            ...params,
            busiCode: "1002",
            tranCode: "361602",
        });
    },
    deleteModelsData(params) {
        return http.post("/model/data/delete", {
            ...params,
            busiCode: "1002",
            tranCode: "361604",
        });
    },
    getTypeTree() {
        return http.post("/model/type/tree", {
            busiCode: "1002",
            tranCode: "361507",
        });
    },
    // 用户端接口
    getList(params) {
        return http.post("/web/model/index", {
            busiCode: "1002",
            tranCode: "361600",
            ...params,
        });
    },
    getTree() {
        return http.post("/web/model/tree", {
            busiCode: "1002",
            tranCode: "361609",
        });
    },
    // 关联模型
    modelLink() {
        return http.post("/web/model/link", {
            busiCode: "1002",
            tranCode: "361610",
        });
    },
    // 解压模型
    webUnzipModel(params) {
        return http.post("/web/unzip/model", {
            busiCode: "1002",
            tranCode: "361611",
            ...params
        });
    }
};
