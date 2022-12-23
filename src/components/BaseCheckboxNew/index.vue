<template>
    <el-checkbox-group
        v-model="newForm"
        :disabled="item.disabled"
        @change="item.callBc && item.callBc(item, newForm)"
    >
        <template v-if="!item.btnStyle">
            <el-checkbox
                v-for="(op, index) in enumsList"
                :key="op.dictValue + index"
                :label="op.dictValue"
                :disabled="op.disabled"
                :border="item.border"
            >
                {{ op.dictLabel }}
            </el-checkbox>
        </template>
        <template v-else>
            <el-checkbox-button
                v-for="(op, index) in enumsList"
                :key="op.dictValue + index"
                :label="op.dictValue"
                :disabled="op.disabled"
                :border="item.border"
            >
                {{ op.dictLabel }}
            </el-checkbox-button>
        </template>
    </el-checkbox-group>
</template>

<script>
export default {
    name: "BaseCheckbox",
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
            type: Array,
            default() {
                return [];
            },
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
