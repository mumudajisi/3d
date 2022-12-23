<template>
    <el-radio-group v-bind="$attrs" :value="value" v-on="$listeners" @change="onChange">
        <template v-for="(item, i) in optionList">
            <el-radio :key="i" :label="item.dictValue">{{ item.dictLabel }}</el-radio>
        </template>
    </el-radio-group>
</template>

<script>
import { dict } from "@/api";

export default {
    name: "BaseRadio",
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
            default: void 0,
        },
    },
    data() {
        return {
            optionList: [],
            // 默认值
            defaultValue: void 0,
        };
    },
    computed: {},
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
                this.$emit("finished");
            }
        },
    },
};
</script>
