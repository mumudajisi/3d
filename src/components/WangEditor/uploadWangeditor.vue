<template>
    <div class="home">
        <div style="border: 1px solid #ccc;">
            <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editor"
                :default-config="toolbarConfig"
                :mode="mode"
            />
            <Editor
                v-model="html"
                style="height: 500px; overflow-y: hidden;"
                :default-config="editorConfig"
                :mode="mode"
                class="editorStyle"
                @onCreated="onCreated"
            />
            <!--@onChange="onChange"-->
        </div>
    </div>
</template>

<script>
import { Editor, Toolbar } from "@wangeditor/editor-for-vue"
import "@wangeditor/editor/dist/css/style.css"
import { v4 as uuidv4 } from "uuid";
import { fileUpload } from "@/api/file";

export default {
    name: "HomeView",
    components: {
        Editor, Toolbar
    },
    model: {
        prop: "value",
        event: "change",
    },
    props: {
        value: {
            type: String,
            default: "",
        },
        placeholder: {
            type: String,
            default() {
                return "请输入内容"
            }
        },
        imgBusiCode: {
            type: [Number, String],
            default() {
                return "1001";
            }
        },
        imgTranCode: {
            type: [Number, String],
            default() {
                return "100001";
            }
        },
        imgFid: {
            type: [Number, String],
            default() {
                return "1";
            }
        },
        // 默认的上传路径
        imgDirname: {
            type: [Number, String],
            default() {
                return "/files/1003/train/article";
            }
        },
        // 图片后端接受上传文件的参数名
        imgFileName: {
            type: [Number, String],
            default() {
                return "file";
            }
        },

        videoBusiCode: {
            type: [Number, String],
            default() {
                return "1001";
            }
        },
        videoTranCode: {
            type: [Number, String],
            default() {
                return "100001";
            }
        },
        videoFid: {
            type: [Number, String],
            default() {
                return "1";
            }
        },
        // 视频文件默认的上传路径
        videoDirname: {
            type: [Number, String],
            default() {
                return "/files/1003/train/article";
            }
        },
        // 视频文件后端接受上传文件的参数名
        videoFileName: {
            type: [Number, String],
            default() {
                return "file";
            }
        },
    },
    data() {
        // 自定义校验链接
        const customCheckLinkFn = (text, url) => {
            if (!url) {
                this.$message.warning("链接不能为空");
                return
            }
            if (url.indexOf("http") !== 0) {
                this.$message.warning("链接必须以 http/https 开头");
                return;
            }
            return true
        }
        // 自定义转换链接 url
        const customParseLinkUrl = (url) => {
            if (url.indexOf("http") !== 0) {
                return `http://${url}`
            }
            return url
        }

        // 自定义校验图片
        const customCheckImageFn = (src, alt, url) => {
            if (!src) {
                this.$message.warning("图片网址不能为空");
                return
            }
            if (src.indexOf("http") !== 0) {
                this.$message.warning("图片地址必须以 http/https 开头");
                return "图片地址必须以 http/https 开头"
            }
            if (url.indexOf("http") !== 0) {
                this.$message.warning("图片链接必须以 http/https 开头");
                return "图片链接必须以 http/https 开头"
            }
            return true
        }

        // 转换图片链接
        const customParseImageSrc = (src) => {
            if (src.indexOf("http") !== 0) {
                return `http://${src}`
            }
            return src
        }

        // 自定义校验视频
        const customCheckVideoFn = (src) => {
            if (!src) {
                return
            }
            if (src.indexOf("http") !== 0) {
                this.$message.warning("视频地址必须以 http/https 开头");
                return "视频地址必须以 http/https 开头"
            }
            return true
        }

        // 自定义转换视频 示例
        // const customParseVideoSrc = (src) => {
        //     if (src.includes(".bilibili.com")) {
        //         const arr = location.pathname.split("/")
        //         const vid = arr[arr.length - 1]
        //         return `<iframe src="//player.bilibili.com/player.html?bvid=${vid}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`
        //     }
        //     return src
        // }

        const that = this;
        return {
            editor: null,
            // html: "",
            toolbarConfig: {},
            editorConfig: {
                placeholder: that.placeholder,

                MENU_CONF: {
                    // 插入链接的校验
                    insertLink: {
                        checkLink: customCheckLinkFn, // 也支持 async 函数
                        parseLinkUrl: customParseLinkUrl // 也支持 async 函数
                    },

                    // 修改链接的校验
                    editLink: {
                        checkLink: customCheckLinkFn, // 也支持 async 函数
                        parseLinkUrl: customParseLinkUrl, // 也支持 async 函数
                    },

                    // 插入网络图片的校验
                    insertImage: {
                        //  插入图片之后的回调
                        onInsertedImage(imageNode) {
                            if (imageNode == null) return
                            const { src, alt, url, href } = imageNode
                            console.log("inserted image", src, alt, url, href)
                        },
                        // 校验图片链接
                        checkImage: customCheckImageFn, // 也支持 async 函数
                        // 转换图片链接
                        parseImageSrc: customParseImageSrc, // 也支持 async 函数
                    },

                    // 编辑网络图片的校验
                    editImage: {
                        // 更新图片之后的回调
                        onUpdatedImage(imageNode = null) {
                            if (imageNode == null) return
                            const { src, alt, url } = imageNode
                            console.log("updated image", src, alt, url)
                        },
                        // 校验图片链接
                        checkImage: customCheckImageFn, // 也支持 async 函数
                        // 转换图片链接
                        parseImageSrc: customParseImageSrc, // 也支持 async 函数
                    },
                    // 图片的上传
                    uploadImage: {
                        async customUpload(file, insertFn) {
                            const formData = new FormData();
                            const uuid = uuidv4()
                            const filenames = uuid + "." + file.name.split(".")[1]

                            formData.set("busiCode", that.imgBusiCode)
                            formData.set("tranCode", that.imgTranCode)
                            formData.set("fid", that.imgFid)
                            formData.set("dirname", that.imgDirname)

                            formData.set(that.imgFileName, file)
                            formData.set("roleCode", that.$store.getters["userx/role"].roleKey)
                            formData.set("loginId", that.$store.getters["userx/user"].userId)
                            formData.set("filenames", filenames)
                            const res = await fileUpload(formData);
                            if (res.respType === 1) {
                                const url = process.env.VUE_APP_RESOURCE_SERVER + that.imgDirname + "/" + filenames
                                insertFn(url, filenames, url); // insertFn 参数1：路径； 参数2：alt值； 参数三：路径
                            } else {
                                that.$message.warning(res.respDesc);
                            }
                        }
                    },

                    // 插入视频校验
                    insertVideo: {
                        // 插入视频之后的回调
                        onInsertedVideo(videoNode = null) {
                            if (videoNode == null) return
                            const { src } = videoNode
                            console.log("inserted video", src)
                        },
                        // 校验视频链接
                        checkVideo: customCheckVideoFn, // 也支持 async 函数
                        // 转换视频链接
                        // parseVideoSrc: customParseVideoSrc, // 也支持 async 函数
                    },

                    // 视频上传
                    uploadVideo: {
                        async customUpload(file, insertFn) {
                            const formData = new FormData();
                            const uuid = uuidv4()
                            const filenames = uuid + "." + file.name.split(".")[1]

                            formData.set("busiCode", that.videoBusiCode)
                            formData.set("tranCode", that.videoTranCode)
                            formData.set("fid", that.videoFid)
                            formData.set("dirname", that.videoDirname)

                            formData.set(that.videoFileName, file)
                            formData.set("roleCode", that.$store.getters["userx/role"].roleKey)
                            formData.set("loginId", that.$store.getters["userx/user"].userId)
                            formData.set("filenames", filenames)
                            const res = await fileUpload(formData);
                            if (res.respType === 1) {
                                const url = process.env.VUE_APP_RESOURCE_SERVER + that.videoDirname + "/" + filenames
                                insertFn(url, filenames, url); // insertFn 参数1：路径； 参数2：alt值； 参数三：路径
                            } else {
                                that.$message.warning(res.respDesc);
                            }
                        }
                    }
                }
            },
            mode: "default", // or 'simple'
        }
    },
    computed: {
        html: {
            get() {
                return this.value;
            },
            set(v) {
                this.$emit("change", v);
            },
        },
    },
    beforeDestroy() {
        const editor = this.editor
        if (editor == null) return
        editor.destroy() // 组件销毁时，及时销毁编辑器
    },
    methods: {
        onCreated(editor) {
            this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
        },
        onChange(val) {
            console.log(val.getHtml())
        }
    }
}
</script>

<style lang="scss" scoped>
.home {
    position: relative;
    z-index: 1000;
}

.editorStyle {
    ::v-deep a, a:focus, a:hover {
        cursor: pointer;
        color: #4290f7;
        text-decoration: underline;
    }

    ::v-deep .w-e-bar-bottom .w-e-select-list {
        width: 120px !important;
        max-height: 150px;
        bottom: inherit;
        margin-top: inherit;
        margin-bottom: 0;
    }
}
</style>
