<template>
    <div class="wangeditor">
        <Toolbar ref="toolbar" class="wangeditor-toobar" :editor="editor" :default-config="toolbarConfig" :mode="mode" />
        <Editor
            v-model="html"
            class="wangeditor-editor"
            :style="editorStyle"
            :default-config="editorConfig"
            :mode="mode"
            @onCreated="onCreated"
            @customPaste="onCustomPaste"
        />
        <!-- mask div 蒙层 -->
        <div v-show="mask" class="wangeditor-mask" @click="onCloseModal" />
    </div>
</template>

<script>
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { DomEditor } from "@wangeditor/editor";
import "@wangeditor/editor/dist/css/style.css";

export default {
    name: "WangEditor",
    components: { Editor, Toolbar },
    model: {
        prop: "value",
        event: "change",
    },
    props: {
        value: {
            type: String,
            default: "",
        },
        mode: {
            type: String,
            default: "default",
        },
        placeholder: {
            type: String,
            default: "请输入内容...",
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        autoFocus: {
            type: Boolean,
            default: false,
        },
        height: {
            type: [String, Number],
            default: 500,
        },
        toolbar: {
            type: [Array, String],
            default: undefined,
        },
        excludeToolBar: {
            type: Array,
            default: () => [],
        },
        modalAppendToBody: {
            type: Boolean,
            default: true,
        },
        maxLength: {
            type: Number,
            default: undefined,
        },
        onMaskClose: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            editor: null,
            mask: false,
        };
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
        toolbarConfig() {
            const defaultValue = {
                excludeKeys: this.excludeToolBar,
                modalAppendToBody: this.modalAppendToBody,
            };
            if (typeof this.toolbar === "string") {
                defaultValue["toolbarKeys"] = this.toolbar.split(",");
            } else if (Array.isArray(this.toolbar)) {
                defaultValue["toolbarKeys"] = this.toolbar;
            }
            return defaultValue;
        },
        editorConfig() {
            const defaultValue = {
                placeholder: this.placeholder,
                readOnly: this.readonly,
                autoFocus: this.autoFocus,
            };
            if (this.maxLength) defaultValue["maxLength"] = this.maxLength;
            return defaultValue;
        },
        editorStyle() {
            return {
                "--editor-height": typeof this.height === "number" ? `${this.height}px` : this.height,
            };
        },
    },
    beforeDestroy() {
        const editor = this.editor;
        if (editor == null) return;
        editor.destroy(); // 组件销毁时，及时销毁编辑器
    },
    methods: {
        // click mask div to hide modal
        onCloseModal() {
            if (!this.onMaskClose) return;
            this.editor.hidePanelOrModal();
        },
        onModalChange() {
            if (!this.modalAppendToBody) return;
            this.editor.on("modalOrPanelShow", (modalOrPanel) => {
                if (modalOrPanel.type !== "modal") return;

                const { $elem } = modalOrPanel; // modal element
                const width = $elem.width();
                const height = $elem.height();

                // set modal position z-index
                $elem.css({
                    left: "50%",
                    top: "50%",
                    marginLeft: `-${width / 2}px`,
                    marginTop: `-${height / 2}px`,
                    zIndex: 10002,
                });

                // show mask
                this.mask = true;
            });
            this.editor.on("modalOrPanelHide", () => {
                // hide mask
                this.mask = false;
            });
        },
        onCreated(editor) {
            this.editor = Object.seal(editor); // 一定要用 Object.seal() ，否则会报错
            // this.editor.getAllMenuKeys()
            this.$nextTick(() => {
                const toolbar = DomEditor.getToolbar(this.editor);
                console.log(this.editor.getAllMenuKeys());
                console.log(toolbar.getConfig().toolbarKeys);
                this.onModalChange();
            });
        },
        onCustomPaste(editor, event, callback) {
            console.log(editor);
            console.log(event);
            console.log(event.readText);
            event.preventDefault();
        },
    },
};
</script>

<style lang="scss">
.wangeditor {
    border: 1px solid #ccc;
    .wangeditor-toobar {
        border-bottom: 1px solid #ccc;
    }
    .wangeditor-editor {
        height: var(--editor-height);
        overflow-y: hidden;
    }
}
.w-e-full-screen-container {
    z-index: 0 !important;
}
.wangeditor-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10001;
    background-color: #00000073;
}
</style>
