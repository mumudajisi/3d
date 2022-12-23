import http from "@/utils/http";

// 获取路由
export default {
    getMenuTree() {
        return http.post("/plat/tree", {
            busiCode: "1001",
            tranCode: "363007",
        });
    },
    getRoleMenuIds(roleCode) {
        return http.post("/plat/tree", {
            busiCode: "1001",
            tranCode: "363007",
            roleCode,
        });
    },
    getMenuList(params) {
        return http.post("/menu/query", {
            busiCode: "1001",
            tranCode: "363003",
            ...params,
        });
    },
    addMenu(params) {
        return http.post("/menu/add", {
            busiCode: "1001",
            tranCode: "363001",
            ...params,
        });
    },
    updateMenu(params) {
        return http.post("/menu/edit", {
            busiCode: "1001",
            tranCode: "363002",
            ...params,
        });
    },
    deleteMenu(params) {
        return http.post("/menu/delete", {
            busiCode: "1001",
            tranCode: "363004",
            ...params,
        });
    },
};
