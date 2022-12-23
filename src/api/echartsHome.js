import http from "@/utils/http"

export default {
    homeDataShow(params) {
        return http.post("/index/data/show", {
            ...params,
            busiCode: "1002",
            tranCode: "361000",
        });
    },
    // 地图的有功功率编辑不保存
    lineSimulation(params) {
        return http.post("/line/simulation", params);
    },
}
