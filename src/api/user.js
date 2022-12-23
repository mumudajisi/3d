import http, { loginHttp } from "@/utils/http";

export default {
    // 登录方法
    login(params) {
        return loginHttp.postForm("/login", params);
    },
    // 退出方法
    logout() {
        return loginHttp.get("/logout");
    },
    getRoles() {
        return http.post("/plat/roles", {
            busiCode: "1001",
            tranCode: "362009",
        });
    },
    getRolesById(id) {
        return http.post("/user/query/rid", {
            busiCode: "1001",
            tranCode: "361009",
            id,
        });
    },
    getUserList(params) {
        return http.post("/user/query", {
            busiCode: "1001",
            tranCode: "361003",
            ...params,
        });
    },
    addUser(params) {
        return http.post("/user/add", {
            busiCode: "1001",
            tranCode: "361001",
            ...params,
        });
    },
    updateUser(params) {
        return http.post("/user/edit", {
            busiCode: "1001",
            tranCode: "361002",
            ...params,
        });
    },
    deleteUser(params) {
        return http.post("/user/delete", {
            busiCode: "1001",
            tranCode: "361004",
            ...params,
        });
    },
    resetPwd(params) {
        return http.post("/user/reset", {
            busiCode: "1001",
            tranCode: "361010",
            ...params,
        });
    },
    editpwd(params) {
        return http.post("/user/edit/pwd", {
            busiCode: "1001",
            tranCode: "361011",
            ...params,
        });
    },
    // 电力用户登录
    thdInSgcc(params) {
        return http.post("/thd/in/sgcc", params);
    },
};
