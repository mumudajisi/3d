import http from "@/utils/http";

export default {
    getOperateLogList(params) {
        return http.post("/oper/query", {
            busiCode: "1001",
            tranCode: "367003",
            ...params,
        });
    },
    deleteOperateLog(params) {
        return http.post("/oper/delete", {
            busiCode: "1001",
            tranCode: "367004",
            ...params,
        });
    },
    clearOperLog() {
        return http.post("/oper/clear", {
            busiCode: "1001",
            tranCode: "367005",
        });
    },
    getLoginLogList(params) {
        return http.post("/log/query", {
            busiCode: "1001",
            tranCode: "366003",
            ...params,
        });
    },
    deleteLoginLog(params) {
        return http.post("/log/delete", {
            busiCode: "1001",
            tranCode: "366004",
            ...params,
        });
    },
    clearLoginLog() {
        return http.post("/log/clear", {
            busiCode: "1001",
            tranCode: "366005",
        });
    },
};
