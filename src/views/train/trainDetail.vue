<template>
    <div v-if="detailInfo" class="train">
        <div class="components">
            <div class="train-title">基础信息</div>
            <el-divider />
            <el-row>
                <el-col
                    v-for="item in basicsData"
                    :key="item.bind"
                    class="train-basics"
                    :span="12"
                >
                    {{ item.name }}：{{ detailInfo[item.bind] }}
                </el-col>
            </el-row>
        </div>
        <div class="components">
            <div class="train-title">培训资源</div>`
            <el-divider />
            <BaseTable
                :other-config="table.otherConfig"
                :table-config="table.config"
                :table-data="table.data"
                :formatter="formatter"
                @selected="selected"
            />
        </div>
        <div class="components">
            <div class="train-title">培训考试</div>
            <el-divider />
            <examUser ref="examUser" :train-code="detailInfo.trainCode" :is-learned="isLearned" :train-name="detailInfo.trainName" />
        </div>
        <div v-if="detailInfo.content" class="components">
            <div class="train-title">培训内容</div>
            <el-divider />
            <div v-html="detailInfo.content" />
        </div>
        <addOrEditResource
            v-if="dialogVisible"
            :title="title"
            :train-code="detailInfo.trainCode"
            :hide-dialog="() => (dialogVisible = false)"
            :row-list="table.data"
            @success="getResourceList"
        />
    </div>
</template>

<script>
import BaseTable from "@/components/BaseTableNew";
import addOrEditResource from "@/views/train/components/addOrEditResource";
import examUser from "@/views/train/components/examUser";
import { model, train } from "@/api";
export default {
    name: "TrainDetail",
    components: {
        BaseTable,
        addOrEditResource,
        examUser
    },
    data() {
        return {
            dialogVisible: false,
            title: "add",
            isLearned: false,
            learnList: [],
            basicsData: [
                {
                    name: "培训名称",
                    bind: "trainName"
                },
                {
                    name: "培训地点",
                    bind: "trainAddr"
                },
                {
                    name: "开始时间",
                    bind: "beginTime"
                },
                {
                    name: "结束时间",
                    bind: "closeTime"
                },
                {
                    name: "创建时间",
                    bind: "createTime"
                },
                {
                    name: "创建人员",
                    bind: "createUser"
                },
            ], // 基础信息配置
            table: {
                data: [],
                config: {
                    header: [
                        {
                            type: "text",
                            prop: "resourceName",
                            name: "培训资源名称"
                        },
                        {
                            type: "textHtml",
                            prop: "resourceType",
                            name: "培训资源类型"
                        },
                    ],
                    outerBtn: [
                        {
                            name: "新增资源",
                            method: "add",
                            icon: "el-icon-plus",
                            code: "train/detail/addOredit",
                            validate: () => { return !this.table.data.length }
                        },
                        {
                            name: "编辑资源",
                            method: "edit",
                            icon: "el-icon-edit",
                            code: "train/detail/addOredit",
                            validate: () => { return this.table.data.length }
                        },
                        {
                            name: "批量删除",
                            method: "deleteChoose",
                            icon: "el-icon-delete",
                            type: "danger",
                            code: "train/detail/delete"
                        },
                    ],
                    innerBtn: [
                        {
                            name: "学习",
                            method: "study",
                            icon: "el-icon-notebook-1",
                            code: "train/detail/study",
                            validate: (item, row) => { return !this.learnList.find(res => res.trainId === row.resourceCode) }
                        },
                        {
                            name: "已学习",
                            method: "learned",
                            icon: "el-icon-notebook-1",
                            code: "train/detail/study",
                            validate: (item, row) => { return this.learnList.find(res => res.trainId === row.resourceCode) }
                        },
                        {
                            name: "删除",
                            method: "delete",
                            icon: "el-icon-delete",
                            code: "train/detail/delete"
                        },
                    ],
                },
                otherConfig: {
                    innerBtnWidth: 300,
                    rowKey: "id", // 行数据的 Key
                    selection: true, // 是否展示多选
                    index: "序号", // 是否显示序号
                    btnAlign: "right"
                },
            },
            selectData: [], // 资源的多选
            detailInfo: null, // 详细信息
            resourceTypeList: [
                {
                    dictLabel: "模拟运行",
                    dictValue: 1
                },
                {
                    dictLabel: "词条",
                    dictValue: 2
                },
                {
                    dictLabel: "模型",
                    dictValue: 3
                },
                {
                    dictLabel: "考试",
                    dictValue: 4
                },
            ]
        }
    },
    watch: {
        "$route.query.id": {
            handler() {
                if (this.$route.path !== "/trainDetail") return false
                this.getDetail()
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        // 新增资源
        add() {
            this.title = "add"
            this.dialogVisible = true
        },
        // 编辑资源
        edit() {
            this.title = "edit"
            this.dialogVisible = true
        },
        // 学习
        study(row) {
            const params = {
                busiCode: 1001,
                tranCode: 362308,
                trainCode: row.trainCode,
                userId: this.$store.getters["userx/id"],
                trainId: row.resourceCode
            }
            train.trainUserLearned(params).then(res => {
                if (res.respType === 1) {
                    this.getResourceList()
                    if (row.resourceType === 1) {
                        this.$router.push("/userShow/userIndex?type=1")
                    } else if (row.resourceType === 2) {
                        this.$router.push(`/userShow/know/info?code=${row.resourceCode}&name=${row.resourceName}`)
                    } else if (row.resourceType === 3) {
                        this.$loading({ text: "加载中" })
                        const params = {
                            ftpId: 1,
                            modelCode: row.resourceCode
                        }
                        model.webUnzipModel(params).then(res => {
                            if (res.respType === 1) {
                                window.open(process.env.VUE_APP_RESOURCE_SERVER + res.respData, "_blank")
                                this.$loading().close()
                            }
                        }).catch(err => {
                            console.log(err)
                            this.$loading().close()
                        })
                    }
                }
            })
        },
        // 已学习
        learned(row) {
            if (row.resourceType === 1) {
                this.$router.push("/userShow/userIndex?type=1")
            } else if (row.resourceType === 2) {
                this.$router.push(`/userShow/know/info?code=${row.resourceCode}&name=${row.resourceName}`)
            } else if (row.resourceType === 3) {
                this.$loading({ text: "加载中" })
                const params = {
                    ftpId: 1,
                    modelCode: row.resourceCode
                }
                model.webUnzipModel(params).then(res => {
                    if (res.respType === 1) {
                        window.open(process.env.VUE_APP_RESOURCE_SERVER + res.respData, "_blank")
                        this.$loading().close()
                    }
                }).catch(err => {
                    console.log(err)
                    this.$loading().close()
                })
            }
        },
        // 资源删除
        delete(row, fn) {
            this.$confirm((typeof fn === "function" ? "是否批量删除选中" : "是否删除id为" + row.id) + "的资源", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(async () => {
                const params = {
                    busiCode: 1001,
                    ids: typeof fn === "function" ? row : [row.id],
                    tranCode: "362204"
                }
                await train.trainRsDelete(params).then((res) => {
                    if (res.respType === 1) {
                        this.$message({
                            type: "success",
                            message: "删除成功!"
                        })
                        if (typeof fn === "function") {
                            fn()
                        }
                        this.getResourceList()
                    }
                })
            })
        },
        // 资源批量删除
        deleteChoose() {
            if (!this.selectData.length) {
                this.$message.warning("请选择要删除的数据")
                return false
            }
            const ids = this.selectData.map((item) => item.id)
            this.delete(ids, () => {
                this.selectData = []
            })
        },
        // 获取详情信息
        getDetail() {
            const params = {
                busiCode: "1001",
                tranCode: "362105",
                id: this.$route.query.id,
            }
            train.trainInfoQuery(params).then(res => {
                if (res.respType === 1) {
                    this.detailInfo = res.respData[0]
                    this.getResourceList()
                    this.$nextTick(() => {
                        this.$refs.examUser.getList()
                    })
                }
            })
        },

        // 资源的多选框的返回数据
        selected(value) {
            this.selectData = value
        },
        // 资源的数据获取
        getResourceList() {
            const pageData = {
                busiCode: "1001",
                tranCode: "362208",
                pageNum: 1,
                pageSize: 0,
                trainCode: this.detailInfo.trainCode,
                types: [1, 2, 3],
            }
            train.trainQueryTypes(pageData).then(res => {
                if (res.respType === 1) {
                    this.isLearned = res.respData.isLearned
                    this.learnList = res.respData.learnList
                    this.table.data = res.respData.pageDatas;
                }
            })
        },
        formatter(key, value, row) {
            if (key === "resourceType") {
                return this.$getFindValue(
                    +row[key],
                    this.resourceTypeList,
                    "dictValue",
                    "dictLabel"
                )
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.train {
    &-title {
        font-size: 18px;
        font-weight: bold;
    }

    &-basics {
        margin-bottom: 20px;
    }
}
</style>
