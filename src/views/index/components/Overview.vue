<template>
    <div>
        <div class="text">数据总览</div>
        <div class="overview">
            <div class="overview-box" :style="{backgroundImage: `url(${knowledgeImg})`}">
                <div class="overview-box-title">
                    知识库
                </div>
                <div class="overview-box-num">
                    词条数：{{ viewList.knowTotalCount }}
                </div>
            </div>
            <div class="overview-box" :style="{backgroundImage: `url(${modelImg})`}">
                <div class="overview-box-title">
                    模型库
                </div>
                <div class="overview-box-num">
                    模型数：{{ viewList.modelTotalCount }}
                </div>
            </div>
            <div class="overview-box" :style="{backgroundImage: `url(${lineImg})`}">
                <div class="overview-box-title">
                    电网线路
                </div>
                <div class="overview-box-num">
                    线路数：{{ viewList.lineTotalCount }}
                </div>
            </div>
            <div class="overview-box" :style="{backgroundImage: `url(${nodeImg})`}">
                <div class="overview-box-title">
                    电网节点
                </div>
                <div class="overview-box-num">
                    节点数：{{ viewList.nodeTotalCount }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Overview",
    props: {
        viewList: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            knowledgeImg: require("../../../assets/images/index/knowledge.png"),
            lineImg: require("../../../assets/images/index/line.png"),
            nodeImg: require("../../../assets/images/index/node.png"),
            modelImg: require("../../../assets/images/index/model.png")
        }
    }
}
</script>

<style lang="scss" scoped>
.text {
    margin: 20px auto 30px 0;
    color: #707070;
    text-align: left;
    font-size: 24px;
    font-weight: bolder;
}
.overview {
    display: flex;
    justify-content: space-around;
    &-box {
        width: 23%;
        margin-bottom: 30px;
        line-height: 40px;
        border-radius: 10px;
        padding: 20px 30px;
        box-shadow: #d5dae3 0 0 5px 5px;
        background-size: 82px;
        background-repeat: no-repeat;
        background-position: 90%;
        &-title {
            font-size: 20px;
            font-weight: bolder;
        }
        &-num {
            font-size: 20px;
            font-weight: bolder;
            color: #1c84c6;
        }
    }
}
</style>
