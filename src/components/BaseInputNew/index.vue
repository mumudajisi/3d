<template>
    <el-input
        v-model="newForm"
        :type="item.type"
        :placeholder="item.placeholder"
        :maxlength="item.maxlength"
        :minlength="item.minlength"
        :show-word-limit="item.showWordLimit || false"
        :clearable="item.clearable || true"
        :show-password="item.showPassword"
        :disabled="item.disabled"
        :size="item.size"
        :prefix-icon="item.prefixIcon"
        :suffix-icon="item.suffixIcon"
        :rows="item.rows"
        :autosize="item.autosize"
        @blur="item.callBc && item.callBc(item, newForm)"
    />
</template>

<script>
export default {
    name: "BaseInput",
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
            default: ""
        }
    },
    data() {
        return {
            newForm: this.form
        }
    },
    watch: {
        form: {
            handler(n) {
                this.newForm = n
            },
            deep: true
        },
        newForm() {
            this.$emit("newForm", this.newForm)
        },
    },
}
</script>

<style lang="scss" scoped></style>
