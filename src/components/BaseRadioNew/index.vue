<template>
    <el-radio-group
        v-model="newForm"
        :disabled="item.disabled"
        @change="item.callBc && item.callBc(item, newForm)"
    >
        <template v-if="!item.btnStyle">
            <el-radio
                v-for="(op, index) in enumsList"
                :key="op.dictValue + index"
                :label="op.dictValue"
                :disabled="op.disabled"
                :border="item.border"
            >
                {{ op.dictLabel }}
            </el-radio>
        </template>
        <template v-else>
            <el-radio-button
                v-for="(op, index) in enumsList"
                :key="op.dictValue + index"
                :label="op.dictValue"
                :disabled="op.disabled"
                :border="item.border"
            >
                {{ op.dictLabel }}
            </el-radio-button>
        </template>
    </el-radio-group>
</template>

<script>
export default {
    name: "BaseTable",
    model: {
        prop: "form",
        event: "newForm",
    },
    props: {
        item: {
            type: Object,
            default() {
                return {};
            },
        },
        form: {
            type: String,
            default: "",
        },
        enumsList: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            newForm: this.form,
        };
    },
    watch: {
        newForm() {
            this.$emit("newForm", this.newForm);
        },
    },
};
</script>

<style lang="scss" scoped></style>
