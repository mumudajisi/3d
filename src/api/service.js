import http from "@/utils/http";

export default {
    getTranList(params) {
        return http.post("/tran/query", {
            ...params,
            busiCode: "1001",
            tranCode: "369003",
        });
    },
    addTran(params) {
        return http.post("/tran/add", {
            ...params,
            busiCode: "1001",
            tranCode: "369001",
        });
    },
    updateTran(params) {
        return http.post("/tran/edit", {
            ...params,
            busiCode: "1001",
            tranCode: "369002",
        });
    },
    deleteTrans(params) {
        return http.post("/tran/delete", {
            ...params,
            busiCode: "1001",
            tranCode: "369004",
        });
    },
};
