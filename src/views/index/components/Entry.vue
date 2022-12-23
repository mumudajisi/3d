<template>
    <div class="entry">
        <div class="text">词条统计</div>
        <div ref="entryCharts" style="width: 100%; height: 100%" />
    </div>
</template>

<script>
import echarts from "echarts"
export default {
    name: "Entry",
    props: {
        knowList: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            echartData: [],
            color: ["#37a2da", "#32c5e9", "#9fe6b8", "#ffdb5c", "#ff9f7f", "#fb7293", "#e7bcf3", "#8378ea"]
        }
    },
    computed: {
        // 计算总量
        total() {
            return this.echartData.reduce((a, b) => {
                return a + b.value * 1
            }, 0)
        },
        // 数字处理加,号
        formatNumber() {
            return (num) => {
                const reg = /(?=(\B)(\d{3})+$)/g;
                return num.toString().replace(reg, ",");
            }
        },
    },
    mounted() {
        const arr = []
        this.knowList.forEach(item => {
            arr.push({
                name: item[0],
                value: item[1]
            })
        })
        this.echartData = arr
        this.$nextTick(() => {
            this.initCharts()
        })
    },
    methods: {
        initCharts() {
            const that = this
            const charts = echarts.init(this.$refs["entryCharts"]);
            const option = {
                color: that.color,
                tooltip: {
                    trigger: "item",
                    formatter: "{a} <br/>{b} : {c} ({d}%)",
                },
                toolbox: {
                    show: true,
                },
                legend: {
                    x: "left", // 水平位置，【left\center\right\数字】
                    y: "top", // 垂直位置，【top\center\bottom\数字】
                    align: "left",
                    // orient: "vertical",
                    icon: "circle",
                    textStyle: {
                        color: "#8C8C8C",
                    },
                },
                series: [
                    {
                        name: "词条类别",
                        type: "pie",
                        radius: [0, 140],
                        data: that.echartData,
                    },
                ],
            };

            charts.setOption(option, true);
        }
    }
}
</script>

<style lang="scss" scoped>
.entry{
    width: 100%;
    height: 480px;
    .text {
        margin: 20px auto 30px 0;
        color: #707070;
        text-align: left;
        font-size: 24px;
        font-weight: bolder;
    }
}
</style>
