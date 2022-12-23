import http from "@/utils/http";

export default {
    getDictList(params) {
        return http.post("/dict/type/query", {
            ...params,
            busiCode: "1001",
            tranCode: "361103",
        });
    },
    addDict(params) {
        return http.post("/dict/type/add", {
            ...params,
            busiCode: "1001",
            tranCode: "361101",
        });
    },
    updateDict(params) {
        return http.post("/dict/type/edit", {
            ...params,
            busiCode: "1001",
            tranCode: "361102",
        });
    },
    deleteDict(params) {
        return http.post("/dict/type/delete", {
            ...params,
            busiCode: "1001",
            tranCode: "361104",
        });
    },
    getDictDataList(params) {
        return http.post("/dict/data/query", {
            ...params,
            busiCode: "1001",
            tranCode: "361203",
        });
    },
    addDictData(params) {
        return http.post("/dict/data/add", {
            ...params,
            busiCode: "1001",
            tranCode: "361201",
        });
    },
    updateDictData(params) {
        return http.post("/dict/data/edit", {
            ...params,
            busiCode: "1001",
            tranCode: "361202",
        });
    },
    deleteDictData(params) {
        return http.post("/dict/data/delete", {
            ...params,
            busiCode: "1001",
            tranCode: "361204",
        });
    },
    getDictTree() {
        return http.post("/dict/tree", {
            busiCode: "1001",
            tranCode: "361107",
        });
    },
    getDictDataTypes(params) {
        return http.post("/dict/data/types", {
            ...params,
            busiCode: "1001",
            tranCode: "361210",
        });
    },
    dataTypes(params) {
        return http.post("/web/data/types", {
            busiCode: "1002",
            tranCode: "361210",
            ...params,
        });
    },
};
