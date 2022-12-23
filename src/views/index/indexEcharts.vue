<template>
    <el-row v-if="dataObj" class="box">
        <Overview :view-list="dataObj.viewList" />
        <el-col :span="12">
            <Entry :know-list="dataObj.knowList" />
        </el-col>
        <el-col :span="12">
            <!--<LineEcharts />-->
            <ModelEcharts :model-list="dataObj.modelList" />
        </el-col>
    </el-row>
</template>

<script>
import { echartsHome } from "@/api"
import Overview from "@/views/index/components/Overview"
import Entry from "@/views/index/components/Entry"
import ModelEcharts from "@/views/index/components/ModelEcharts"

export default {
    name: "Echarts",
    components: {
        Overview,
        Entry,
        // LineEcharts,
        ModelEcharts
    },
    data() {
        return {
            dataObj: null,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            echartsHome.homeDataShow().then(res => {
                if (res.respType === 1) {
                    this.dataObj = {
                        knowList: res.respData.knowList,
                        modelList: res.respData.modelList,
                        viewList: {
                            knowTotalCount: res.respData.knowTotalCount,
                            lineTotalCount: res.respData.lineTotalCount,
                            modelTotalCount: res.respData.modelTotalCount,
                            nodeTotalCount: res.respData.nodeTotalCount,
                        }
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.box {
    height: 100%;
    padding: 1px 20px 0 20px;
}
</style>
