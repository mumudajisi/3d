
import http from "@/utils/http";

const dict = {
    // 根据字典类型获取数据
    dataTypes(params) {
        return http.post("/data/types", {
            busiCode: "1002",
            tranCode: "361210",
            ...params,
        });
    },
}
const know = {
    getList(params) {
        return http.post("/know/index", {
            busiCode: "1002",
            tranCode: "361400",
            ...params,
        });
    },
    getTree() {
        return http.post("/know/tree", {
            busiCode: "1002",
            tranCode: "361409",
        });
    },
    // 关联词条
    knowLink() {
        return http.post("/know/link", {
            busiCode: "1002",
            tranCode: "361410",
        });
    },
    // 词条查询详情
    knowDetail(params) {
        return http.post("/know/detail", {
            busiCode: "1002",
            tranCode: "361412",
            ...params
        });
    }
}
const model = {
    getList(params) {
        return http.post("/model/index", {
            busiCode: "1002",
            tranCode: "361600",
            ...params,
        });
    },
    getTree() {
        return http.post("/model/tree", {
            busiCode: "1002",
            tranCode: "361609",
        });
    },
    // 关联模型
    modelLink() {
        return http.post("/model/link", {
            busiCode: "1002",
            tranCode: "361610",
        });
    },
    // 解压模型
    webUnzipModel(params) {
        return http.post("/unzip/model", {
            busiCode: "1002",
            tranCode: "361611",
            ...params
        });
    }
}
const user = {
    getList(params) {
        return http.post("/user/index", {
            busiCode: "1002",
            tranCode: "361600",
            ...params,
        });
    },
    getTree() {
        return http.post("/user/tree", {
            busiCode: "1002",
            tranCode: "361609",
        });
    }
}
const line = {
    getList(params) {
        return http.post("/line/loading", {
            busiCode: "1002",
            tranCode: "361830",
            ...params,
        });
    },
}

export {
    know,
    model,
    user,
    line,
    dict
};

export default {
};
