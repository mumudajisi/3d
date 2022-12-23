<template>
    <el-select v-bind="$attrs" :value="value" v-on="$listeners" @change="onChange">
        <template v-for="(item, i) in optionList">
            <el-option :key="i" :label="item.dictLabel" :value="item.dictValue" />
        </template>
    </el-select>
</template>

<script>
import { dict } from "@/api";

export default {
    name: "BaseSelect",
    model: {
        prop: "value",
        event: "change",
    },
    props: {
        type: {
            type: String,
            default: void 0,
        },
        value: {
            type: [String, Number],
            default: "",
        },
    },
    data() {
        return {
            optionList: [],
            // 默认值
            defaultValue: void 0,
        };
    },
    watch: {
        type: {
            immediate: true,
            handler(value) {
                this.getList(value);
            },
        },
    },
    methods: {
        onChange(value) {
            this.$emit("change", value);
        },
        async getList(type) {
            if (!type) return;
            try {
                const { respData } = await dict.getDictDataList({
                    pageNum: 1,
                    pageSize: 100000000,
                    dictCode: type,
                });
                this.optionList = respData.list || [];
                const option = this.optionList.find((item) => item.isDefault === "Y");
                if (option) {
                    this.defaultValue = option.dictValue;
                    this.onChange(option.dictValue);
                    this.$emit("init", this.defaultValue);
                }
            } catch (error) {
                console.log(error);
            } finally {
                this.$emit("finished", this.optionList);
            }
        },
    },
};
</script>
