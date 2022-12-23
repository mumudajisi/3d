import http from "@/utils/http";

export default {
    getDeptTree() {
        return http.post("/plat/dept", {
            busiCode: "1001",
            tranCode: "364007",
        });
    },
    getDeptList(params) {
        return http.post("/dept/query", {
            busiCode: "1001",
            tranCode: "364003",
            ...params,
        });
    },
    addDept(params) {
        return http.post("/dept/add", {
            busiCode: "1001",
            tranCode: "364001",
            ...params,
        });
    },
    updateDept(params) {
        return http.post("/dept/edit", {
            busiCode: "1001",
            tranCode: "364002",
            ...params,
        });
    },
    deleteDept(params) {
        return http.post("/dept/delete", {
            busiCode: "1001",
            tranCode: "364004",
            ...params,
        });
    },
};
