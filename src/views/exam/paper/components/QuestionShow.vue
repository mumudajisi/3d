<template>
    <div class="components box">
        <template v-for="(item, index) in items">
            <!--单选,多选,判断-->
            <div v-if="item.topicType === '1' || item.topicType === '2' || item.topicType === '3'" :key="index" class="flex">
                <div>
                    <div class="q-title">
                        <div class="label">题目{{ index + 1 }}：</div>
                        <div v-html="item.topic" />
                    </div>
                    <div class="q-content">
                        <span v-for="val in item.options" :key="val.dictValue" class="q-item-contain">
                            <span class="q-item-prefix">{{ val.dictLabel }}：</span>
                            <span class="q-item-content" v-html="val.content" />
                        </span>
                    </div>
                </div>
                <el-button type="text" style="color: #f00;" @click="questionDelete(index)">删除</el-button>
            </div>
            <!--填空,简答-->
            <div v-else-if="item.topicType === '4' || item.topicType === '5'" :key="index" class="flex">
                <div class="q-title">
                    <div class="label">题目{{ index + 1 }}：</div>
                    <div v-html="item.topic" />
                </div>
                <el-button type="text" style="color: #f00;" @click="questionDelete(index)">删除</el-button>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    name: "QuestionShow",
    props: {
        items: {
            type: Array,
            default() {
                return []
            }
        }
    },
    methods: {
        questionDelete(index) {
            this.$emit("questionDelete", index)
        },
    }
}
</script>

<style lang="scss" scoped>
.box {
    margin-top: 10px;
    .flex {
        display: flex;
        justify-content: space-between;
    }
}
.q-title {
    display: flex;
    justify-content: flex-start;
    .label {
        font-weight: bolder;
    }
    ::v-deep p {
        margin: 0;
    }
}
.q-content {
    margin-left: 50px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    ::v-deep p {
        margin: 0;
    }
    .q-item-contain {
        margin-right: 20px;
        display: flex;
        justify-content: flex-start;
    }
}
</style>
