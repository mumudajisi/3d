import http from "@/utils/http";

export default {
    getPostList(params) {
        return http.post("/post/query", {
            ...params,
            busiCode: "1001",
            tranCode: "365003",
        });
    },
    addPost(params) {
        return http.post("/post/add", {
            ...params,
            busiCode: "1001",
            tranCode: "365001",
        });
    },
    updatePost(params) {
        return http.post("/post/edit", {
            ...params,
            busiCode: "1001",
            tranCode: "365002",
        });
    },
    deletePosts(params) {
        return http.post("/post/delete", {
            ...params,
            busiCode: "1001",
            tranCode: "365004",
        });
    },
};
