<template>
    <div class="content">
        <div ref="charts" style="width: 100%; height: 100%" />
        <div v-if="dialogVisible" class="dialog">
            <div class="article-wrapper">
                <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="150px" class="demo-ruleForm">
                    <el-form-item label="有功功率(MW)" prop="nodePower">
                        <el-input v-model="ruleForm.nodePower" type="number" />
                    </el-form-item>
                </el-form>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submit">确 定</el-button>
                </div>
            </div>
        </div>
        <div v-if="introVisible" class="intro">
            <div class="intro-dot" :style="{top: dotTop + 'px', left: dotLeft + 'px'}" />
            <div class="intro-tooltip" />
        </div>
    </div>
</template>

<script>
import * as echarts from "echarts";
import { getMap } from "@/views/userShow/userIndex/mapName";
import axios from "axios";
import { dict, know, model, echartsHome } from "@/api"
import bg from "@/assets/images/background.png"

export default {
    data() {
        return {
            introVisible: false,
            introVisibleTwo: false,
            reg: /([0-9]+\.[0-9]{2})[0-9]*/,
            dialogVisible: false, // 弹框
            ruleForm: {
                nodePower: ""
            },
            rules: {
                nodePower: [
                    { required: true, message: "请输入有功功率", trigger: "change" },
                ],
            },
            nodePowerIndex: 0, // 节点编辑的时候下标
            nodeType: null, // 节点类型字典
            volLevel: null, // 电压级别字典
            belongMap: null, // 地图名称字典
            KnowLinkData: null, // 词条数据
            modelLinkData: null, // 模型数据
            lineData: null, // 线路数据
            mapName: "", // 地图名称
            mapJson: "", // 地图文件
            resultList: null, // 所有词条的数据
            findRes: [], // 当前词条里面包含的数据
            graphicData: [
                {
                    type: "image", // 图形元素类型
                    id: "logo", // 更新或删除图形元素时指定更新哪个图形元素，如果不需要用可以忽略。
                    right: "center", // 根据父元素进行定位 （居中）
                    bottom: "0%", // 根据父元素进行定位   （0%）, 如果bottom的值是 0，也可以删除该bottom属性值。
                    z: 0, // 层叠
                    bounding: "all", // 决定此图形元素在定位时，对自身的包围盒计算方式
                    style: {
                        image: bg, // 这里一定要注意、注意，必须是https开头的图片路径地址
                        width: window.innerWidth,
                        height: window.innerHeight,
                        opacity: 0.1
                    }
                },
                {
                    type: "text",
                    right: "4%",
                    bottom: "5%",
                    style: {
                        text: "重置",
                        font: "bolder 1.2rem \"Microsoft YaHei\", sans-serif",
                        fill: "#fff",
                    },
                    onclick: (val) => {
                        sessionStorage.removeItem("nodePower")
                        sessionStorage.removeItem("linePowerData")
                        this.graphicData.splice(3);
                        this.getData();
                    }
                },
                {
                    type: "text",
                    left: "2%",
                    top: "6%",
                    style: {
                        text: "中国",
                        font: "bolder 1.2rem \"Microsoft YaHei\", sans-serif",
                        fill: "#fff",
                    },
                    onclick: (val) => {
                        const index = this.graphicData.findIndex(v => v.style.text === val.target.style.text);
                        // 点击元素之后的所有元素全部删除
                        this.graphicData.splice(index + 1);
                        this.getData();
                    }
                },
            ], // echarts配置
            charts: null,
            tooltipPosition: false,
            seriesIndex: -1,
            seriesDataIndex: -1,
            dotTop: "51.3%",
            dotLeft: "48.7%"
        }
    },
    computed: {
        // 获取电压
        getVol() {
            return function (val) {
                return this.volLevel.find(item => item.dictValue === val)?.dictLabel || val
            }
        },
        // 获取节点类型
        getType() {
            return function (val) {
                return this.nodeType.find(item => item.dictValue === val)?.dictLabel || val
            }
        },
        // 获取词条
        getKnow() {
            return function (val) {
                return this.KnowLinkData.find(item => item.id === +val) || val
            }
        },
        // 获取模型
        getModel() {
            return function (val) {
                return this.modelLinkData.find(item => item.id === +val) || val
            }
        },
        // 获取字典地图名称
        getMapName() {
            return function (val) {
                return this.belongMap.find(item => item.dictValue === val)?.dictLabel || val
            }
        }
    },
    watch: {
        $route: {
            handler() {
                if (this.$route.path !== "/userShow/userIndex") return
                if (this.$route.query.type === "1") {
                    this.introVisibleTwo = true
                    if (!this.introVisible && this.introVisibleTwo) {
                        this.introVisible = true
                        this.$nextTick(() => {
                            this.initIntro()
                        })
                    }
                }
            },
            deep: true,
        }
    },
    created() {
        sessionStorage.removeItem("nodePower")
        sessionStorage.removeItem("linePowerData")
        this.getKnowLink()
        this.getModelLink()
        this.getDict()
        if (this.$route.query.type === "1") {
            this.introVisibleTwo = true
        }
    },
    methods: {
        // 获取字典表的数据
        getDict() {
            const params = {
                typeList: [
                    "node_type",
                    "vol_level",
                    "belong_map"
                ]
            }
            dict.dataTypes(params).then(res => {
                if (res.respType === 1) {
                    this.nodeType = res.respData.node_type // 节点类型字典
                    this.volLevel = res.respData.vol_level // 电压级别字典
                    this.belongMap = res.respData.belong_map // 地图名称字典
                    this.getData()
                }
            })
        },
        // 获取词条的数据
        getKnowLink() {
            know.knowLink().then(res => {
                if (res.respType === 1) {
                    this.KnowLinkData = res.respData
                }
            })
        },
        // 获取模型的数据
        getModelLink() {
            model.modelLink().then(res => {
                if (res.respType === 1) {
                    this.modelLinkData = res.respData
                }
            })
        },
        // 获取地图数据
        getData(lineLevel = 1, belongNode) {
            const data = { lineLevel: lineLevel, belongNode: belongNode, busiCode: "1002", tranCode: "361830" };
            axios({
                method: "post",
                url: process.env.VUE_APP_BASE_API + "/web/line/loading",
                data: data
            }).then(res => {
                if (res.data.respType === 1) {
                    const sessionLinePowerData = JSON.parse(sessionStorage.getItem("linePowerData"))
                    const sessionNodePower = JSON.parse(sessionStorage.getItem("nodePower"))
                    if (sessionLinePowerData) {
                        res.data.respData?.lines?.map(item => {
                            Object.keys(sessionLinePowerData).forEach((key) => {
                                if (+item.id === +key) {
                                    item.lineCur = sessionLinePowerData[key].toFixed(2)
                                }
                            })
                        })
                        res.data.respData?.points?.map(item => {
                            Object.keys(sessionNodePower).forEach((key) => {
                                if (+item.id === +key) {
                                    item.nodePower = sessionNodePower[key]
                                }
                            })
                        })
                    }
                    this.lineData = res.data.respData
                    const [mapName, mapJson] = getMap(this.getMapName(res.data.respData.lines[0].belongMap))
                    this.mapName = mapName
                    this.mapJson = mapJson
                    this.$nextTick(() => {
                        this.initCharts();
                    })
                } else {
                    this.$message.error("出错了请重试")
                }
            }).catch(err => {
                console.log(err)
                this.$message.error("出错了请重试")
            })
        },
        // 初始化地图
        initCharts() {
            const that = this
            this.charts = echarts.init(this.$refs["charts"]);
            this.charts.off("dblclick")
            this.charts.off("click")
            const option = {
                graphic: that.graphicData,
                series: [
                    {
                        type: "effectScatter",
                        coordinateSystem: "geo",
                        effectType: "ripple",
                        showEffectOn: "render",
                        rippleEffect: {
                            period: 4,
                            scale: 1,
                            brushType: "fill",
                        },
                        hoverAnimation: true,
                        label: {
                            normal: {
                                formatter: "{b}",
                                position: "right",
                                offset: [15, 0],
                                color: "#000000",
                                show: true
                            },
                        },
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    return params.data.color ? params.data.color : "#1C655F"
                                },
                                shadowBlur: 10,
                                shadowColor: "#333",
                            },
                        },
                        zlevel: 1,
                        data: that.lineData.pointsData,
                    },
                    // 地图飞线
                    {
                        type: "lines",
                        coordinateSystem: "geo",
                        zlevel: 15,
                        effect: {
                            show: true,
                            period: 2.5,
                            trailLength: 0,
                            symbol: "arrow",
                            color: that.lineData.linesData.lineColor,
                            symbolSize: 8,
                        },
                        lineStyle: {
                            normal: { width: 4, opacity: 0.6, curveness: 0.1, color: "#FFB800" }
                        },
                        data: that.lineData.linesData
                    }
                ],
                // 背景颜色
                backgroundColor: "#01746f",
                // 提示浮窗样式
                tooltip: {
                    show: true,
                    trigger: "item",
                    alwaysShowContent: false,
                    backgroundColor: "rgba(8, 41, 60, 0.7)",
                    borderWidth: 3,
                    borderColor: "rgba(17,197,222,0.9)",
                    hideDelay: 100,
                    triggerOn: "click",
                    enterable: true,
                    padding: 10,
                    position: that.tooltipPosition,
                    textStyle: {
                        color: "#39ced2",
                        fontSize: "14",
                        width: 20,
                        lineHeight: 25,
                        overflow: "break",
                    },
                    extraCssText: "box-shadow: 0 0 10px rgba(17,197,222,0.9); width: 250px;",
                    showDelay: 100,
                    formatter(params) {
                        if (params.seriesType === "effectScatter") {
                            return `<h3 class="title-h3">${params.name}</h3>
                                <div>节点类型：${that.getType(that.lineData.points[params.dataIndex].nodeType)}</div>
                                <div>节点电压：${that.getVol(that.lineData.points[params.dataIndex].nodeVol)}</div>
                                <div>有功功率：${that.lineData.points[params.dataIndex].nodePower ? that.lineData.points[params.dataIndex].nodePower + "MW" : "--"}
                                    <span style="display: ${that.lineData.points[params.dataIndex].nodeType === "7" ? "inline-block" : "none"}" class="text-edit" @click="${that.editPower(params)}">编辑</span>
                                </div>
                                <div style="display: ${that.lineData.points[params.dataIndex].knowPoint ? "block" : "none"
}" class="point" @click="${that.toPoint(params)}">关联词条：${that.getKnow(that.lineData.points[params.dataIndex].knowPoint).knowTitle}</div>
                                <div style="display: ${that.lineData.points[params.dataIndex].knowPoint ? "none" : "block"}">关联词条：暂无词条</div>
                                <div style="display: ${that.lineData.points[params.dataIndex].linkModel ? "block" : "none"}" class="model" @click="${that.toModel(params)}">关联模型：${that.getModel(that.lineData.points[params.dataIndex].linkModel).modelTitle}</div>
                                <div style="display: ${that.lineData.points[params.dataIndex].linkModel ? "none" : "block"}" >关联模型：暂无模型</div>
                                `
                        } else if (params.seriesType === "lines") {
                            return `
                                <h3 class="title-h3">${params.name}</h3>
                                <div>线路电压：${that.lineData.lines[params.dataIndex].lineVol}</div>
                                <div>输送功率：${Number(that.lineData.lines[params.dataIndex].lineCur.replace(that.reg, "$1"))}MW</div>
                                <div style="display: ${that.lineData.lines[params.dataIndex].linkKnow ? "block" : "none"
}" class="point" @click="${that.toPoint(params)}">关联词条：${that.getKnow(that.lineData.lines[params.dataIndex].linkKnow).knowTitle}</div>
                                <div style="display: ${that.lineData.lines[params.dataIndex].linkKnow ? "none" : "block"}">关联词条：暂无词条</div>
                                <div style="display: ${that.lineData.lines[params.dataIndex].linkModel ? "block" : "none"}" class="model" @click="${that.toModel(params)}">关联模型：${that.getModel(that.lineData.lines[params.dataIndex].linkModel).modelTitle} </div>
                                <div style="display: ${that.getModel(that.lineData.lines[params.dataIndex].linkModel) ? "none" : "block"}" >关联模型：暂无模型</div>
                            `
                        }
                    }
                },
                // 地图配置
                geo: {
                    map: that.mapName,
                    zoom: 1.2,
                    // 是否开启缩放平移
                    roam: true,
                    // 地图区域的样式设置
                    itemStyle: {
                        normal: {
                            borderColor: "rgb(83,106,111)",
                            borderWidth: 1,
                            areaColor: {
                                type: "radial",
                                x: 0.5,
                                y: 0.5,
                                r: 0.8,
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: "rgba(197,208,210, 1)", // 0% 处的颜色
                                    },
                                    {
                                        offset: 1,
                                        color: "rgba(197,208,210, 1)", // 100% 处的颜色
                                    },
                                ],
                                globalCoord: false, // 缺省为 false
                            },
                            shadowColor: "rgba(197,208,210, 1)",
                            shadowOffsetX: -2,
                            shadowOffsetY: 2,
                            shadowBlur: 10,
                        },
                        // 鼠标放上去高亮的样式
                        emphasis: {
                            areaColor: "rgb(141,160,164)",
                            borderWidth: 0,
                        },
                    },
                },
            };
            // 地图注册，第一个参数的名字必须和option.geo.map一致
            echarts.registerMap(that.mapName, that.mapJson)

            this.charts.on("dblclick", (params) => {
                const point = this.charts.convertFromPixel("geo", [params.event.offsetX, params.event.offsetY])
                for (let i = 0; i < that.lineData.pointsData.length; i++) {
                    let flag = true;
                    const num = +that.lineData.lines[0].lineLevel === 1 ? 0.5 : 0.01
                    if (point[0] < that.lineData.pointsData[i].value[0] - num) {
                        flag = false;
                    }
                    if (point[0] > that.lineData.pointsData[i].value[0] + num) {
                        flag = false;
                    }
                    if (point[1] < that.lineData.pointsData[i].value[1] - num) {
                        flag = false;
                    }
                    if (point[1] > that.lineData.pointsData[i].value[1] + num) {
                        flag = false;
                    }
                    if (flag && that.lineData.pointsData[i][2] !== "" && +that.lineData.points[i].canClick) {
                        const belongNode = that.lineData.points[i].id;
                        const nodeLevel = that.lineData.points[i].nodeLevel;
                        const lineLevel = parseInt(nodeLevel) + 1;

                        // 为了重新定位，这里使用了length
                        const idx = that.graphicData.length + 1;
                        that.graphicData.push({
                            type: "text",
                            top: `${idx * 0.8 * idx}%`,
                            left: "2%",
                            style: {
                                text: that.lineData.points[i].nodeName,
                                font: "bolder 1.2rem \"Microsoft YaHei\", sans-serif",
                                fill: "#fff",
                            },
                            idNum: belongNode,
                            onclick: (val) => {
                                const index = that.graphicData.findIndex(v => v.style.text === val.target.style.text);
                                // 点击元素之后的所有元素全部删除
                                that.getData(index - 1, that.graphicData[index].idNum);
                                that.graphicData.splice(index + 1);
                            },
                        })

                        that.getData(lineLevel, belongNode);
                        break;
                    }
                }
            })
            this.charts.setOption(option, true);
            this.charts.dispatchAction({
                type: "showTip",
                seriesIndex: this.seriesIndex, // 针对series下第几个数据
                dataIndex: this.seriesDataIndex // 第几个数据
            })
            const offset = this.coordinateToOffset({
                lng: this.lineData.points[this.seriesDataIndex !== -1 ? this.seriesDataIndex : 1].longitude,
                lat: this.lineData.points[this.seriesDataIndex !== -1 ? this.seriesDataIndex : 1].latitude
            })
            this.dotLeft = offset.x
            this.dotTop = offset.y
            if (!this.introVisible && this.introVisibleTwo) {
                this.introVisible = true
                this.$nextTick(() => {
                    this.initIntro()
                })
            }
        },
        // 关联模型点击
        toModel(data) {
            this.$nextTick(() => {
                const obj1 = document.getElementsByClassName("model")[0]
                obj1.addEventListener("click", () => {
                    this.$loading({ text: "加载中" })
                    let linkModel = this.lineData.points[data.dataIndex].linkModel
                    if (data.seriesType === "effectScatter") {
                        linkModel = this.lineData.points[data.dataIndex].linkModel
                    } else if (data.seriesType === "lines") {
                        linkModel = this.lineData.lines[data.dataIndex].linkModel
                    }

                    const item = this.modelLinkData.find(item => +item.id === +linkModel)
                    const params = {
                        ftpId: 1,
                        id: item.id,
                        modelCode: item.modelLight,
                    }
                    model.webUnzipModel(params).then(res => {
                        if (res.respType === 1) {
                            this.$amberBuried({
                                postScript: "模型",
                                resourceId: this.lineData.points[data.dataIndex].linkModel,
                                scoreMode: 12,
                                scoreType: 1,
                                remark: item.modelTitle
                            })
                            window.open(process.env.VUE_APP_RESOURCE_SERVER + res.respData, "_blank")
                            this.$loading().close()
                        }
                    }).catch(err => {
                        console.log(err)
                        this.$loading().close()
                    })
                });
            });
        },
        // 关联词条点击
        toPoint(data) {
            this.$nextTick(() => {
                const obj1 = document.getElementsByClassName("point")[0];
                obj1.addEventListener("click", () => {
                    let item = this.getKnow(this.lineData.points[data.dataIndex].knowPoint)
                    if (data.seriesType === "effectScatter") {
                        item = this.getKnow(this.lineData.points[data.dataIndex].knowPoint)
                    } else if (data.seriesType === "lines") {
                        item = this.getKnow(this.lineData.lines[data.dataIndex].linkKnow)
                    }
                    if (!item.knowCode && !item.knowTitle) return false
                    this.$router.push({
                        path: "/userShow/know/info",
                        query: {
                            code: item.knowCode,
                            name: item.knowTitle
                        }
                    })
                });
            });
        },
        // 编辑节点变电站
        editPower(data) {
            this.$nextTick(() => {
                const obj1 = document.getElementsByClassName("text-edit")[0];
                obj1.addEventListener("click", () => {
                    this.dialogVisible = true
                    this.nodePowerIndex = data.dataIndex
                })
            })
        },
        submit() {
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    const params = {
                        busiCode: "1002",
                        tranCode: "361832",
                        id: this.lineData.points[this.nodePowerIndex].id, // 节点id
                        projectCode: this.lineData.points[this.nodePowerIndex].projectCode, // 工程编号
                        nodePower: this.ruleForm.nodePower, // 节点功率
                    }
                    echartsHome.lineSimulation(params).then(res => {
                        if (res.respType === 1) {
                            const belongNode = this.lineData.points[this.nodePowerIndex].parentId; // 节点的父id
                            const lineLevel = this.lineData.points[this.nodePowerIndex].nodeLevel; // 节点的等级
                            this.getData(lineLevel, belongNode)
                            const sessionNodePower = JSON.parse(sessionStorage.getItem("nodePower")) || {}
                            sessionStorage.setItem("linePowerData", JSON.stringify(res.respData))
                            sessionStorage.setItem("nodePower", JSON.stringify({
                                ...sessionNodePower,
                                [params.id]: params.nodePower
                            }))
                            this.ruleForm.nodePower = ""
                            this.dialogVisible = false
                        }
                    })
                } else {
                    return false;
                }
            });
        },
        // 初始化引导
        initIntro() {
            const that = this
            const intro = this.$intro().setOptions({
                nextLabel: "下一步", // 下一个按钮文字
                prevLabel: "上一步", // 上一个按钮文字
                // skipLabel: "跳过", // 跳过按钮文字
                doneLabel: "完成", // 完成按钮文字
                hidePrev: true, // 在第一步中是否隐藏上一个按钮
                exitOnOverlayClick: false, // 点击叠加层时是否退出介绍
                showStepNumbers: false, // 是否显示步骤编号
                disableInteraction: true, // 是否禁用与突出显示的框内的元素的交互，就是禁止点击
                showBullets: false, // 是否显示面板指示点
                steps: [
                    {
                        element: ".intro-dot",
                        title: "step1",
                        intro: "双击黄色节点可进入下一级",
                    },
                    {
                        // element: ".intro-tooltip",
                        title: "step2",
                        intro: "点击线路可查看线路信息",
                    },
                    {
                        element: ".intro-dot",
                        title: "step3",
                        intro: "点击节点可查看节点信息",
                    },
                    {
                        // element: ".intro-tooltip",
                        title: "step4",
                        intro: "点击编辑修改发电站有功功率",
                    },
                    {
                        element: ".demo-ruleForm",
                        title: "step5",
                        intro: "输入有功功率重新计算线路输出功率（例：1000）",
                    },
                    {
                        // element: ".intro-tooltip",
                        title: "step6",
                        intro: "对比修改前后线路的输出功率",
                    },
                    {
                        // element: ".intro-tooltip",
                        title: "step7",
                        intro: "点击关联词条查看词条内容",
                    },
                    {
                        // element: ".intro-tooltip",
                        title: "step8",
                        intro: "点击关联模型运行模型",
                    },
                ]
            })
            intro.onchange(function () {
                if (this._currentStep === 1) {
                    const offset = that.coordinateToOffset({ lng: that.lineData.points[0].longitude, lat: that.lineData.points[0].latitude })
                    that.dotLeft = offset.x
                    that.dotTop = offset.y
                    that.tooltipPosition = ["46.7%", "58.7%"]
                    that.seriesIndex = 1
                    that.seriesDataIndex = 1
                    that.getData(2, 31)
                    return false;
                } else if (this._currentStep === 2) {
                    that.seriesIndex = -1
                    that.seriesDataIndex = 0
                    that.initCharts()
                } else if (this._currentStep === 3) {
                    that.$set(that, "seriesIndex", 0)
                    that.$set(that, "seriesDataIndex", 0)
                    that.initCharts(2, 31)
                    that.dialogVisible = false
                    return false;
                } else if (this._currentStep === 4) {
                    that.dialogVisible = true
                } else if (this._currentStep === 5) {
                    that.$set(that, "seriesIndex", 1)
                    that.$set(that, "seriesDataIndex", 1)
                    that.nodePowerIndex = 0
                    that.ruleForm.nodePower = "1000"
                    that.submit()
                    that.dialogVisible = false
                } else if (this._currentStep === 6) {
                    that.seriesIndex = 0
                    that.seriesDataIndex = 1
                    that.initCharts()
                }
            })
            intro.onexit(function () {
                that.tooltipPosition = false
                that.seriesIndex = -1
                that.seriesDataIndex = -1
                that.introVisible = false
                sessionStorage.removeItem("nodePower")
                sessionStorage.removeItem("linePowerData")
                that.graphicData.splice(3);
                that.introVisibleTwo = false
                that.getData();
            }).start()
        },
        coordinateToOffset({ lng, lat }) {
            const seriesModel = this.charts.getModel().getSeriesByIndex(0);
            const coordSys = seriesModel.coordinateSystem;
            const point = coordSys.dataToPoint([lng, lat]);
            return {
                x: point[0] - 4,
                y: point[1] - 4
            };
        }
    },
};
</script>
<style lang="scss" scoped>
.content {
    position: relative;
    width: 100%;
    height: 100%;
}
::v-deep .point, ::v-deep .model, ::v-deep .text-edit {
    cursor: pointer;
    color: #5ba8fc;
    text-decoration: underline;
    word-break: break-all;
    word-wrap: break-word;
    white-space:pre-line;
}
::v-deep .title-h3 {
    word-break: break-all;
    word-wrap: break-word;
    white-space:pre-line;
}

canvas {
    width: 100% !important;
    height: 100% !important;
}

.intro {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0);
    &-dot {
        position: absolute;
        width: 10px;
        height: 10px;
    }
    &-tooltip {
        position: absolute;
        top: 58.7%;
        left: 46.7%;
        width: 250px;
        height: 202px;
    }
}

.dialog {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    .article-wrapper {
        margin: 80px auto 0;
        width: 800px;
        max-height: 80%;
        overflow: auto;
        padding: 30px;
        background-color: #FFFFFF;
        .dialog-footer {
            text-align: right;
        }
    }
}

.bottom-text {
    display: inline-block;
    color: #0000EE;
    text-decoration: underline;
    margin-left:10px
}

::v-deep .el-dialog__wrapper {
    z-index: 9999999 !important;
}
</style>
