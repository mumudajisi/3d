import http from "@/utils/http";

export default {
    getNodeList(params) {
        return http.post("/node/query", {
            ...params,
            busiCode: "1002",
            tranCode: "361703",
        });
    },
    addNode(params) {
        return http.post("/node/add", {
            ...params,
            busiCode: "1002",
            tranCode: "361701",
        });
    },
    updateNode(params) {
        return http.post("/node/edit", {
            ...params,
            busiCode: "1002",
            tranCode: "361702",
        });
    },
    deleteNodes(params) {
        return http.post("/node/delete", {
            ...params,
            busiCode: "1002",
            tranCode: "361704",
        });
    },
    nodeLinkKnow() {
        return http.post("/node/link/know", {
            busiCode: "1002",
            tranCode: "361410",
        });
    },
    nodeLinkModel() {
        return http.post("/node/link/model", {
            busiCode: "1002",
            tranCode: "361610",
        });
    },
    getLineList(params) {
        return http.post("/line/query", {
            ...params,
            busiCode: "1002",
            tranCode: "361803",
        });
    },
    addLine(params) {
        return http.post("/line/add", {
            ...params,
            busiCode: "1002",
            tranCode: "361801",
        });
    },
    getNodeTree(params) {
        return http.post("/node/tree", {
            ...params,
            busiCode: "1002",
            tranCode: "361707",
        });
    },
    updateLine(params) {
        return http.post("/line/edit", {
            ...params,
            busiCode: "1002",
            tranCode: "361802",
        });
    },
    deleteLines(params) {
        return http.post("/line/delete", {
            ...params,
            busiCode: "1002",
            tranCode: "361804",
        });
    },

};
