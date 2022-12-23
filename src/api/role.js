import http from "@/utils/http";

export default {
    getRoleList(params) {
        return http.post("/role/query", {
            ...params,
            busiCode: "1001",
            tranCode: "362003",
        });
    },
    addRole(params) {
        return http.post("/role/add", {
            ...params,
            busiCode: "1001",
            tranCode: "362001",
        });
    },
    updateRole(params) {
        return http.post("/role/edit", {
            ...params,
            busiCode: "1001",
            tranCode: "362002",
        });
    },
    deleteRoles(params) {
        return http.post("/role/delete", {
            ...params,
            busiCode: "1001",
            tranCode: "362004",
        });
    },
};
