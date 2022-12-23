import http from "@/utils/http";

export default {
    getParamList(params) {
        return http.post("/param/query", {
            ...params,
            busiCode: "1001",
            tranCode: "368003",
        });
    },
    addParam(params) {
        return http.post("/param/add", {
            ...params,
            busiCode: "1001",
            tranCode: "368001",
        });
    },
    updateParam(params) {
        return http.post("/param/edit", {
            ...params,
            busiCode: "1001",
            tranCode: "368002",
        });
    },
    deleteParams(params) {
        return http.post("/param/delete", {
            ...params,
            busiCode: "1001",
            tranCode: "368004",
        });
    },
};
