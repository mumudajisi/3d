<template>
    <el-select
        v-model="newForm"
        :placeholder="item.placeholder"
        :multiple="item.multiple"
        :disabled="item.disabled"
        :clearable="item.clearable || true"
        :collapse-tags="item.collapseTags"
        :multiple-limit="item.multipleLimit"
        :filterable="item.filterable !== 'false'"
        @change="item.callBc && item.callBc(item, newForm)"
    >
        <el-option
            v-for="op in enumsList"
            :key="op.dictValue"
            :label="op.dictLabel"
            :value="op.dictValue"
        />
    </el-select>
</template>

<script>
export default {
    name: "BaseSelect",
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
            type: [String, Array],
            default() {
                return null;
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
