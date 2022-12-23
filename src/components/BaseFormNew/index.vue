<template>
    <section class="form-config">
        <el-form
            :ref="refForm"
            :inline="true"
            :model="ruleForm"
            :label-width="otherConfig.labelWidth || 'auto'"
            size="mini"
            :rules="rules"
            :validate-on-rule-change="false"
            :disabled="otherConfig.disabled"
            label-position="right"
        >
            <template v-for="(item, index) in config">
                <el-form-item
                    v-if="!item.isHide && (item.showHide ? item.showHide(item) : true)"
                    :key="index"
                    :label="item.name"
                    :prop="item.bind"
                    :class="['col-' + (item.col ? item.col : 12), 'relative']"
                    :style="'padding-left:' + (otherConfig.labelWidth || '120px')"
                >
                    <!--text, textarea, number-->
                    <BaseInput
                        v-if="
                            item.type === 'text' ||
                                item.type === 'textarea' ||
                                item.type === 'number'
                        "
                        v-model="ruleForm[item.bind]"
                        :item="item"
                    />
                    <!--radio-->
                    <BaseRadio
                        v-else-if="item.type === 'radio'"
                        v-model="ruleForm[item.bind]"
                        :item="item"
                        :enums-list="enums[item.dataList]"
                    />
                    <!--checkbox-->
                    <BaseCheckbox
                        v-else-if="item.type === 'checkbox'"
                        v-model="ruleForm[item.bind]"
                        :item="item"
                        :enums-list="enums[item.dataList]"
                    />
                    <!--inputNumber可以理解为另一种形式的number-->
                    <el-input-number
                        v-else-if="item.type === 'inputNumber'"
                        v-model="ruleForm[item.bind]"
                        :min="item.min"
                        :max="item.max"
                        :step="item.step"
                        :step-strictly="item.stepStrictly"
                        :precision="item.precision"
                        :disabled="item.disabled"
                        :controls="item.controls"
                        :controls-position="item.controlsPosition || 'right'"
                        :placeholder="item.placeholder"
                        @change="item.callBc && item.callBc(item, ruleForm[item.bind])"
                    />
                    <!--select-->
                    <BaseSelect
                        v-else-if="item.type === 'select'"
                        v-model="ruleForm[item.bind]"
                        :item="item"
                        :enums-list="enums[item.dataList]"
                    />
                    <!--cascade-->
                    <BaseCascade
                        v-else-if="item.type === 'cascade'"
                        v-model="ruleForm[item.bind]"
                        :item="item"
                        :enums-list="enums[item.dataList]"
                    />
                    <!--switch-->
                    <el-switch
                        v-else-if="item.type === 'switch'"
                        v-model="ruleForm[item.bind]"
                        :active-text="item.activeText"
                        :inactive-text="item.inactiveText"
                        :disabled="item.disabled"
                        :validate-event="false"
                        @change="item.callBc && item.callBc(item, ruleForm[item.bind])"
                    />
                    <!--timePicker-->
                    <el-time-picker
                        v-else-if="item.type === 'timePicker'"
                        v-model="ruleForm[item.bind]"
                        :is-range="item.isRange"
                        :clearable="item.clearable !== 'false'"
                        :disabled="item.disabled"
                        :readonly="item.readonly"
                        :value-format="item.valueFormat || 'HH:mm:ss'"
                        :range-separator="item.rangeSeparator || '至'"
                        :start-placeholder="item.startPlaceholder || '开始时间'"
                        :end-placeholder="item.endPlaceholder || '结束时间'"
                        :placeholder="item.placeholder || '选择时间范围'"
                        :picker-options="item.pickerOptions || null"
                        @change="item.callBc && item.callBc(item, ruleForm[item.bind])"
                    />
                    <!--timeSelect-->
                    <el-time-select
                        v-else-if="item.type === 'timeSelect'"
                        v-model="ruleForm[item.bind]"
                        :clearable="item.clearable !== 'false'"
                        :disabled="item.disabled"
                        :readonly="item.readonly"
                        :placeholder="item.placeholder || '选择时间'"
                        :picker-options="item.pickerOptions"
                        @change="item.callBc && item.callBc(item, ruleForm[item.bind])"
                    />
                    <!--datePicker-->
                    <el-date-picker
                        v-else-if="item.type === 'datePicker'"
                        v-model="ruleForm[item.bind]"
                        :type="item.dateType"
                        :disabled="item.disabled"
                        :clearable="item.clearable"
                        :placeholder="item.placeholder"
                        :start-placeholder="item.startPlaceholder"
                        :end-placeholder="item.endPlaceholder"
                        :picker-options="item.pickerOptions"
                        :format="item.format"
                        :default-value="item.defaultValue"
                        :default-time="item.defaultTime"
                        :value-format="item.valueFormat"
                        @change="item.callBc && item.callBc(item, ruleForm[item.bind])"
                        @input="daterangeChange"
                    />
                    <!--rate-->
                    <el-rate
                        v-else-if="item.type === 'rate'"
                        v-model="ruleForm[item.bind]"
                        :max="item.max"
                        :disabled="item.disabled"
                        :allow-half="item.allowHalf"
                        :low-threshold="item.lowThreshold"
                        :high-threshold="item.highThreshold"
                        :colors="item.colors"
                        :void-color="item.voidColor"
                        :disabled-void-color="item.disabledVoidColor"
                        :icon-classes="item.iconClasses"
                        :void-icon-class="item.voidIconClass"
                        :disabled-void-icon-class="item.disabledVoidIconClass"
                        :show-text="item.showText"
                        :show-score="item.showScore"
                        :text-color="item.textColor"
                        :texts="item.texts"
                        :score-template="item.scoreTemplate"
                        @change="item.callBc && item.callBc(item, ruleForm[item.bind])"
                    />
                    <!--upload-->
                    <BaseUpload
                        v-else-if="item.type === 'upload'"
                        v-model="ruleForm[item.bind]"
                        :item="item"
                    />
                    <!--tinymce-->
                    <BaseTinymce
                        v-else-if="item.type === 'tinymce'"
                        v-model="ruleForm[item.bind]"
                        :item="item"
                    />
                    <!--slot-->
                    <slot
                        v-else-if="item.type === 'slot'"
                        :name="item.slotName || 'default'"
                    />
                </el-form-item>
            </template>
        </el-form>
    </section>
</template>

<script>
import BaseInput from "@/components/BaseInputNew"
import BaseRadio from "@/components/BaseRadioNew"
import BaseCheckbox from "@/components/BaseCheckboxNew"
import BaseSelect from "@/components/BaseSelectNew"
import BaseCascade from "@/components/BaseCascadeNew"
import BaseUpload from "@/components/BaseUploadNew"
import BaseTinymce from "@/components/BaseTinymce"

export default {
    name: "BaseForm",
    components: {
        BaseInput,
        BaseRadio,
        BaseCheckbox,
        BaseSelect,
        BaseCascade,
        BaseUpload,
        BaseTinymce
    },
    model: {
        prop: "form",
        event: "ruleForm"
    },
    props: {
        // 绑定的所有字段	表单数据对象
        form: {
            type: Object,
            default() {
                return {}
            }
        },
        // 表单的配置项
        config: {
            type: Array,
            default() {
                return []
            }
        },
        // 其他配置项
        otherConfig: {
            type: Object,
            default() {
                return {}
            }
        },
        // 多个表单同时存在的时候必须要每个单独设置
        refForm: {
            type: String,
            default: "refForm"
        },
        // 枚举数据
        enums: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            ruleForm: this.form,
            rules: {}
        }
    },
    watch: {
        ruleForm() {
            this.$emit("ruleForm", this.ruleForm)
        }
    },
    mounted() {
        this.createRulesRequired()
    },
    methods: {
        // 更新视图使用
        daterangeChange() {
            this.$nextTick(() => {
                this.$forceUpdate()
            })
        },
        // 创建校验规则
        createRulesRequired() {
            const obj = {}
            this.config.map((res) => {
                // 必填项校验
                if (res.bind) {
                    const arr = res.required ? [{}] : []
                    if (res.required) {
                        if (res.trigger) {
                            arr[0].trigger = res.trigger
                            arr[0].required = true
                        }
                        if (arr[0].required) {
                            arr[0].message = res.required
                        }
                    }
                    obj[res.bind] = arr
                }
            })
            this.otherRules(obj)
        },
        /**
         * 其他校验规则
         * @param {Object} obj 基础校验完成的对象
         */
        otherRules(obj) {
            this.config.map((res) => {
                if (res.rules) {
                    obj[res.bind] = obj[res.bind].concat(res.rules)
                }
            })
            this.rules = obj
        },
        // 校验
        validate() {
            let flag = false
            this.$refs[this.refForm].validate((valid, obj) => {
                if (valid) {
                    flag = this.ruleForm
                } else {
                    let str = ""
                    for (const key in obj) {
                        if (str === "") {
                            str += "请检查以下信息：" + obj[key][0]["message"]
                        } else {
                            str += "、" + obj[key][0]["message"]
                        }
                    }
                    this.$message.warning(str)
                }
            })
            return flag
        }
    }
}
</script>

<style lang="scss" scoped>
.form-config {
    .col-24 {
        width: 100%;
    }

    .col-12 {
        width: 50%;
    }

    .col-7 {
        width: 33.3%;
    }

    .col-6 {
        width: 25%;
    }

    ::v-deep .el-form-item__content {
        width: 100%;
        position: relative;
    }

    ::v-deep .el-input,
    ::v-deep .el-select,
    ::v-deep .el-date-editor,
    ::v-deep .el-cascader {
        width: 100%;
    }

    .el-form--inline ::v-deep .el-form-item {
        margin-right: 0;
        padding-right: 10px;
    }

    ::v-deep .el-form-item__label {
        position: absolute;
        top: 0;
        left: 0;
    }
}
</style>
