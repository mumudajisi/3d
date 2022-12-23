import request from "@/utils/request"

// 用户头像上传
export function uploadAvatar(data) {
    return request({
        url: "/file/upload",
        method: "post",
        data: data
    })
}

export function fileUpload(data) {
    return request({
        url: "/file/upload",
        method: "post",
        data: data
    });
}
