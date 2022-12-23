import axios from "axios";
import { Message } from "element-ui";
import store from "@/store";

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";

// 错误列表
const ErrMsgMap = [];

const showMessage = (message, delay = 3000) => {
    if (ErrMsgMap.includes(message)) return;
    ErrMsgMap.push(message);
    Message({
        message: message,
        type: "error",
        duration: 2000,
        onClose: () => {
            const time = setTimeout(() => {
                const index = ErrMsgMap.findIndex((e) => e === message);
                if (index !== -1) ErrMsgMap.splice(index, 1);
                clearTimeout(time);
            }, delay);
        },
    });
};

class Https {
    service;

    constructor(config) {
        this.service = axios.create(config);
        this.request();
        this.response();
    }

    request() {
        this.service.interceptors.request.use((config) => {
            if (!["/login", "/thd/in/sgcc"].includes(config.url)) {
                const token = store.getters["userx/token"];
                const userId = store.getters["userx/id"];
                const roleKey = store.getters["userx/role"]?.roleKey;
                // 添加 loginId roleCode 判断白名单
                if (config.method === "post") {
                    const data = {
                        ...config.data,
                        loginId: userId,
                    };
                        // 判断 roleCode 白名单
                    if (!["/plat/roles"].includes(config.url) && !("roleCode" in data)) {
                        data.roleCode = userId === "admin" ? "plat" : roleKey;
                    }
                    config.data = data;
                }
                if (token) {
                    config.headers["Authorization"] = "Bearer " + token;
                }
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
        );
    }

    response() {
        this.service.interceptors.response.use((response) => {
            // 二进制数据则直接返回
            if (["blob", "arraybuffer"].includes(response.request.responseType)) {
                return response.data;
            }
            const code = response.data?.respType;
            if (code === 1) {
                return response.data;
            } else {
                if (["PLATB402", "PLATB014"].includes(response.data?.respCode)) {
                    store.dispatch("userx/logout").then(() => {
                        location.href = "/";
                    });
                }
                const errorMessage = response.data?.respDesc;
                showMessage(errorMessage);
                return Promise.reject(response);
            }
        },
        (error) => {
            console.log("err => ", error);
            let { message } = error;
            if (message === "Network Error") {
                message = "后端接口连接异常";
            } else if (message.includes("timeout")) {
                message = "系统接口请求超时";
            } else if (message.includes("Request failed with status code")) {
                message = "系统接口" + message.substr(message.length - 3) + "异常";
            }
            showMessage(message);
            return Promise.reject(error);
        });
    }

    requset(params) {
        return this.service.request(params);
    }

    getUri(config) {
        return this.service.getUri(config);
    }

    get(url, params, headers) {
        return this.service.get(url, { params, headers });
    }

    delete(url, params, headers) {
        return this.service.delete(url, { params, headers });
    }

    head(url, params, headers) {
        return this.service.head(url, { params, headers });
    }

    options(url, params, headers) {
        return this.service.options(url, { params, headers });
    }

    post(url, data, headers) {
        return this.service.post(url, data, { headers });
    }

    postForm(url, data, headers) {
        const form = new FormData();
        Object.keys(data).forEach((key) => {
            form.append(key, data[key]);
        });
        return this.service.post(url, form, {
            headers: {
                "content-type": "multipart/form-data",
                ...headers,
            },
        });
    }

    put(url, data, headers) {
        return this.service.put(url, data, { headers });
    }

    patch(url, data, headers) {
        return this.service.patch(url, data, { headers });
    }
}

export default Https;
