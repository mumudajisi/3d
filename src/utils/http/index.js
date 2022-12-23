import Http from "./http";

function createApi(api, ip) {
    console.log("当前请求后端服务：", ip, api)
    return process.env.NODE_ENV === "development" ? api : ip;
}

const loginHttp = new Http({
    baseURL: createApi("/login-api", process.env.VUE_APP_BASE_LOGIN_API),
    // 超时
    timeout: 10000,
});

const http = new Http({
    baseURL: createApi("/api", process.env.VUE_APP_BASE_API),
    // 超时
    timeout: 10000,
});

const httpExam = new Http({
    baseURL: createApi("/api", process.env.VUE_APP_BASE_API),
    // 超时
    timeout: 10000,
});

const resourceHttp = new Http({
    baseURL: createApi("/resource", process.env.VUE_APP_BASE_API_RESOURCE),
    // 超时
    timeout: 10000,
});

export { loginHttp, http, resourceHttp, httpExam };

export default http;
