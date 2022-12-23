<template>
    <el-cascader
        v-model="newForm"
        :options="enumsList"
        :props="item.props"
        :placeholder="item.placeholder"
        :disabled="item.disabled"
        :clearable="item.clearable"
        :show-all-levels="item.showAllLevels"
        :collapse-tags="item.collapseTags"
        :separator="item.separator"
        :filterable="item.filterable"
        @change="item.callBc && item.callBc(item, newForm)"
    />
</template>

<script>
export default {
    name: "BaseCascade",
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
