<template>
    <div class="base-form-wrapper" :class="baseFormClass">
        <el-form ref="formRef" class="base-form" :model="model" :rules="rules" :label-width="labelWidth" inline :size="size" @keyup.enter.native="handleClick">
            <template v-for="(c, i) in components">
                <el-form-item
                    v-show="isHiddle(i)"
                    :ref="`formItemRef`"
                    :key="i"
                    class="base-form-item"
                    :label="c.label"
                    :prop="c.prop"
                    :style="{
                        width: c.width || defaultLabelWidth,
                        '--label-width': labelWidth,
                    }"
                >
                    <template v-if="'renderLabel' in c" #label>
                        <Render :h="c.renderLabel" :data="[c, i]" />
                    </template>
                    <template v-if="'render' in c">
                        <Render :h="c.render" :data="[c, i]" />
                    </template>
                    <template v-else>
                        <component
                            :is="c.component"
                            v-model="model[c.prop]"
                            :style="`width: ${c.componentProp.width || defaultWidth}`"
                            v-bind="c.componentProp"
                            :clearable="c.clearable || clearable"
                            v-on="c.on || void 0"
                        >
                            <template v-if="c.component === 'el-select'">
                                <template v-for="(o, i2) in c.selectOption">
                                    <el-option :key="i2" v-bind="o" />
                                </template>
                            </template>
                        </component>
                    </template>
                </el-form-item>
            </template>

            <el-form-item v-if="showSearch" ref="formItemBtnRef" class="base-form-item">
                <el-button v-if="hiddenNum !== -1" :icon="toggleIcon" size="mini" circle @click="visiable = !visiable" />
                <el-button type="primary" icon="el-icon-search" @click="handleClick"> 搜索 </el-button>
                <el-button icon="el-icon-refresh" @click="reset"> 重置 </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import Render from "../Render/Render.vue"

export default {
    name: "BaseForm",
    components: {
        Render
    },
    props: {
        model: {
            type: Object,
            default: () => ({})
        },
        components: {
            type: Array,
            default: () => []
        },
        mode: {
            type: String,
            default: "search",
            validator(v) {
                return ["search", "dialog"].includes(v)
            }
        },
        rules: {
            type: Object,
            default: () => ({})
        },
        clearable: {
            type: Boolean,
            default: true
        },
        defaultLabelWidth: {
            type: String,
            default: "auto"
        },
        defaultWidth: {
            type: String,
            default: "100%"
        },
        showSearch: {
            type: Boolean,
            default: false
        },
        labelWidth: {
            type: String,
            default: void 0
        },
        hiddenNum: {
            type: Number,
            default: -1
        },
        size: {
            type: String,
            default: void 0
        }
    },
    data() {
        return {
            visiable: true,
            beginShowIndex: -1
        }
    },
    computed: {
        isHiddle() {
            return (i) => (this.hiddenNum === -1 || !this.visiable ? true : i < this.hiddenNum)
        },
        toggleIcon() {
            return this.visiable ? "el-icon-arrow-down" : "el-icon-arrow-up"
        },
        baseFormClass() {
            return {
                "base-form-wrapper--search": this.mode === "search",
                "base-form-wrapper-dialog": this.mode === "dialog"
            }
        }
    },
    methods: {
        validate(callback) {
            this.$refs["formRef"].validate(callback)
        },
        validateField(props, callback) {
            this.$refs["formRef"].validate(props, callback)
        },
        resetFields() {
            this.$refs["formRef"].resetFields()
        },
        clearValidate(props) {
            this.$refs["formRef"].validate(props)
        },
        handleClick() {
            this.$emit("search")
        },
        reset() {
            this.resetFields()
            this.$emit("reset")
            this.handleClick()
        }
    }
}
</script>

<style lang="scss" scoped>
.base-form-wrapper {
    display: flex;
    flex-wrap: wrap;
}
.base-form-wrapper--search {
    width: calc(100% - 20px);
    // padding: 10px 10px 0;
    // -webkit-box-shadow: 2px 0 6px rgba(0, 21, 41, 0.25);
    // box-shadow: 2px 0 6px rgba(0, 21, 41, 0.25);
    align-items: center;
}
.mbase-form-wrapper--dialog {
    width: 100%;
    height: 100%;
    margin: 10px;
}
.base-form {
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .base-form-item {
        &:not(:last-child) {
            margin-right: 20px;
        }
    }
}
.base-form-wrapper::v-deep {
    .el-form-item__content {
        width: calc(100% - var(--label-width));
    }
}
</style>
