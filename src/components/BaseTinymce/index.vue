<template>
    <div>
        <vue-tinymce v-model="newForm" :setting="setting" :setup="setup" />
    </div>
</template>

<script>
import axios from "axios"
import { v4 as uuidv4 } from "uuid"

export default {
    name: "BaseTinymce",
    model: {
        prop: "form",
        event: "newForm"
    },
    props: {
        item: {
            type: Object,
            default() {
                return {}
            }
        },
        form: {
            type: String,
            default() {
                return ""
            }
        }
    },
    data() {
        return {
            newForm: this.form,
            actionUrl: process.env.VUE_APP_BASE_API + "/file/upload", // 上传的图片服务器地址
            setting: {
                menubar: false, // 1级菜单
                plugins:
                    "print preview searchreplace visualblocks visualchars fullscreen image link media code codesample table charmap hr emoticons pagebreak nonbreaking anchor insertdatetime advlist lists wordcount toc kityformula-editor indent2em importword upfile",
                toolbar:
                    "fullscreen undo redo restoredraft | cut copy paste pastetext | kityformula-editor gapFilling | forecolor backcolor bold italic underline strikethrough lineheight  | link anchor styleselect fontselect fontsizeselect alignleft aligncenter alignright alignjustify outdent indent indent2em bullist numlist selectall searchreplace visualblocks blockquote subscript superscript removeformat table image upfile media charmap hr pagebreak nonbreaking insertdatetime print preview code codesample emoticons toc visualchars wordcount importword ",
                readonly: this.item.readonly || false, // 是否只读
                contextmenu_never_use_native: true, // 在编辑器中屏蔽浏览器本身的右键菜单
                elementpath: true, // 设为false时，可隐藏底栏的元素路径
                font_formats:
                    "微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;", // 字体样式
                fontsize_formats:
                    "12px 14px 16px 18px 20px 22px 24px 28px 32px 36px 48px 56px 72px", // 字体大小
                lineheight_formats: "0.5 0.8 1 1.2 1.5 1.75 2 2.5 3 4 5", // 行高配置，也可配置成"12px 14px 16px 20px"这种形式
                language: "zh_CN", // 本地化设置
                placeholder: this.item.placeholder || "请输入...",
                branding: false, // 隐藏右下角技术支持
                statusbar: false, // 显示隐藏状态栏
                height: this.item.height || 400,
                toolbar_mode: this.item.toolbarMode || "sliding", // 工具栏模式 floating / sliding / scrolling / wrap
                automatic_uploads: true, // 图片自动上传
                paste_data_images: true, // 图片是否可粘贴
                images_upload_handler: this.images_upload_handler, // 自定义图片上传
                file_callback: this.fileCallBack,
                file_picker_callback: this.mediaVideo,
                content_style: `.gapFilling {
    color: #f00;
    padding: 0 20px;
    border-bottom: 1px solid #f00;
}`
            }
        }
    },
    watch: {
        newForm() {
            this.$emit("newForm", this.newForm)
        }
    },
    mounted() {
        this.images_upload_handler()
    },
    methods: {
        setup(editor) {
            const spanRegex = new RegExp('<span class="gapFilling">(.*?)<\\/span>', "g")
            const gapFillingItems = this.newForm.match(spanRegex)
            let num = gapFillingItems?.length || 0
            editor.ui.registry.addButton("gapFilling", {
                // 按钮，名
                text: "插入填空",
                onAction: function () {
                    editor.insertContent(`&nbsp;<span class="gapFilling">${++num}</span>&nbsp;`)
                }
            })
        },
        /**
         * @param blobInfo blobInfo
         * @param sucFun 成功回调
         * @param failFun 失败回调
         */
        images_upload_handler(blobInfo, sucFun, failFun) {
            if (!blobInfo) return false
            const file = blobInfo.blob() // 转化为易于理解的file对象
            const testMsg = file.name.substring(file.name.lastIndexOf(".") + 1)
            const filenames =
                this.item.randomName === false ? file.name : uuidv4() + "." + testMsg
            const formData = new FormData()
            for (const k in this.item.data) {
                formData.append(k, this.item.data[k]) // file 和 后端字段要保持一致
            }
            formData.append(this.item.filenames || "filenames", filenames)
            formData.append(this.item.uploadName || "file", file)
            const config = {
                headers: this.item.headers || {
                    ContentType: "multipart/form-data",
                    Authorization: "Bearer " + this.$store.getters["userx/token"]
                },
                timeout: 600000 // 这里10分钟内的配置是生效的，超过了就不行。。
            }
            axios
                .post(this.item.actionUrl || this.actionUrl, formData, config)
                .then((res) => {
                    if (["PLATB402", "PLATB014"].includes(res.data?.respCode)) {
                        this.$store.dispatch("userx/logout").then(() => {
                            location.href = "/"
                        })
                    } else {
                        sucFun(
                            process.env.VUE_APP_RESOURCE_SERVER +
                            "/" +
                            res.data.respData[file.name]
                        )
                    }
                })
                .catch((err) => {
                    failFun(err)
                })
        },
        /**
         * 过滤函数 file_callback 配置参数
         * @param file 文件对象【file】
         * @param sucFun 成功回调函数 传入 html标签字符串【Function类型】(url|string,obj)
         */
        fileCallBack(file, sucFun) {
            const testMsg = file.name.substring(file.name.lastIndexOf(".") + 1)
            const filenames =
                this.item.randomName === false ? file.name : uuidv4() + "." + testMsg
            const formData = new FormData()
            for (const k in this.item.data) {
                formData.append(k, this.item.data[k]) // file 和 后端字段要保持一致
            }
            formData.append(this.item.filenames || "filenames", filenames)
            formData.append(this.item.uploadName || "file", file)
            const config = {
                headers: this.item.headers || {
                    ContentType: "multipart/form-data",
                    Authorization: "Bearer " + this.$store.getters["userx/token"]
                },
                timeout: 600000 // 这里10分钟内的配置是生效的，超过了就不行。。
            }
            axios
                .post(this.item.actionUrl || this.actionUrl, formData, config)
                .then((res) => {
                    if (["PLATB402", "PLATB014"].includes(res.data?.respCode)) {
                        this.$store.dispatch("userx/logout").then(() => {
                            location.href = "/"
                        })
                    } else {
                        sucFun(
                            process.env.VUE_APP_RESOURCE_SERVER +
                            "/" +
                            res.data.respData[file.name],
                            { text: file.name }
                        )
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        // 视频上传
        mediaVideo(callback, value, meta) {
            let input
            if (meta.filetype === "media") {
                input = document.createElement("input")
                input.setAttribute("type", "file")
                input.setAttribute(
                    "accept",
                    "video/mp4,video/AVI,video/mov,video/FLV,video/rmvb,video/mtv,video/mpeg"
                )
                const that = this
                input.onchange = function () {
                    const file = this.files[0]
                    const ext = file.name.substring(file.name.lastIndexOf(".") + 1)
                    const filenames =
                        that.item.randomName === false ? file.name : uuidv4() + "." + ext
                    const formData = new FormData()
                    for (const k in that.item.data) {
                        formData.append(k, that.item.data[k]) // file 和 后端字段要保持一致
                    }
                    formData.append(that.item.filenames || "filenames", filenames)
                    formData.append(that.item.uploadName || "file", file)
                    const config = {
                        headers: that.item.headers || {
                            ContentType: "multipart/form-data",
                            Authorization: "Bearer " + that.$store.getters["userx/token"]
                        },
                        timeout: 600000 // 这里10分钟内的配置是生效的，超过了就不行。。
                    }
                    axios
                        .post(that.item.actionUrl || that.actionUrl, formData, config)
                        .then((res) => {
                            if (["PLATB402", "PLATB014"].includes(res.data?.respCode)) {
                                that.$store.dispatch("user/logout").then(() => {
                                    location.href = "/"
                                })
                            } else {
                                callback(
                                    process.env.VUE_APP_RESOURCE_SERVER +
                                    "/" +
                                    res.data.respData[file.name]
                                )
                            }
                        })
                }
                input.click()
            } else if (meta.filetype === "image") {
                // 视频封面
                input = document.createElement("input")
                input.setAttribute("type", "file")
                input.setAttribute(
                    "accept",
                    "image/gif,image/jpeg,image/png,image/jpg"
                )
                const that = this
                input.onchange = function () {
                    const file = this.files[0]
                    const ext = file.name.substring(file.name.lastIndexOf(".") + 1)
                    const filenames =
                        that.item.randomName === false ? file.name : uuidv4() + "." + ext
                    const formData = new FormData()
                    for (const k in that.item.data) {
                        formData.append(k, that.item.data[k]) // file 和 后端字段要保持一致
                    }
                    formData.append(that.item.filenames || "filenames", filenames)
                    formData.append(that.item.uploadName || "file", file)
                    const config = {
                        headers: that.item.headers || {
                            ContentType: "multipart/form-data",
                            Authorization: "Bearer " + that.$store.getters["userx/token"]
                        },
                        timeout: 600000 // 这里10分钟内的配置是生效的，超过了就不行。。
                    }
                    axios
                        .post(that.item.actionUrl || that.actionUrl, formData, config)
                        .then((res) => {
                            if (["PLATB402", "PLATB014"].includes(res.data?.respCode)) {
                                that.$store.dispatch("user/logout").then(() => {
                                    location.href = "/"
                                })
                            } else {
                                callback(
                                    process.env.VUE_APP_RESOURCE_SERVER +
                                    "/" +
                                    res.data.respData[file.name]
                                )
                            }
                        })
                }
                input.click()
            }
        }
    }
}
</script>

<style lang="scss" scoped></style>
