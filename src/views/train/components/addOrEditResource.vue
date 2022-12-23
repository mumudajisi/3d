<template>
    <el-dialog
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :title="title === 'edit' ? '编辑资源' : '新增资源'"
        append-to-body
        destroy-on-close
        visible
        width="900px"
        @close="hideDialog"
    >
        <BaseForm
            ref="refForm"
            v-model="form.data"
            :config="form.config"
            :enums="form.enums"
            :other-config="form.otherConfig"
            ref-form="refForm"
        />
        <span slot="footer">
            <el-button @click="hideDialog">取 消</el-button>
            <el-button type="primary" @click="submit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import BaseForm from "@/components/BaseFormNew"
import { know, model, train } from "@/api";
export default {
    name: "AddOrEditProject",
    components: {
        BaseForm
    },
    props: {
        hideDialog: {
            type: Function,
            default() {
                return () => {
                }
            }
        },
        title: {
            type: String,
            default: "add"
        },
        trainCode: {
            type: [String, Number],
            default() {
                return "";
            }
        },
        rowList: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            knowList: [],
            modelList: [],
            form: {
                otherConfig: {
                    labelWidth: "100px"
                },
                config: [
                    {
                        col: 24,
                        type: "select",
                        name: "模拟运行",
                        placeholder: "请选择模拟运行",
                        bind: "simulation",
                        dataList: "simulationList",
                        trigger: "change",
                        rules: []
                    },
                    {
                        col: 24,
                        type: "select",
                        name: "关联词条",
                        multiple: true,
                        placeholder: "请选择关联词条",
                        bind: "know",
                        dataList: "knowList",
                        trigger: "change",
                        rules: []
                    },
                    {
                        col: 24,
                        type: "select",
                        name: "关联模型",
                        multiple: true,
                        placeholder: "请选择关联模型",
                        bind: "model",
                        dataList: "modelList",
                        trigger: "change",
                        rules: []
                    },
                ],
                enums: {
                    simulationList: [{
                        dictLabel: "模拟运行",
                        dictValue: "1",
                    }],
                    knowList: [],
                    modelList: []
                },
                data: {
                    simulation: "",
                    know: [],
                    model: []
                }
            }
        }
    },
    mounted() {
        if (this.title === "edit") {
            this.handleEdit()
        }
        this.getKnow()
    },
    methods: {
        submit() {
            if (!this.form.data.simulation && !this.form.data.know.length && !this.form.data.model.length) {
                this.$message.warning("请至少选择一项添加")
                return false
            }
            const params = {
                busiCode: "1001",
                tranCode: "362202",
                resourceCode: [],
                resourceTypes: [1, 2, 3],
                trainCode: this.trainCode,
            }
            if (this.form.data.simulation) {
                params.resourceCode.push({
                    trainCode: this.trainCode,
                    resourceType: 1,
                    resourceCode: this.form.data.simulation,
                    resourceName: "模拟运行"
                })
            }
            if (this.form.data.know.length) {
                this.form.data.know.forEach(item => {
                    this.knowList.forEach(val => {
                        if (item === val.knowCode) {
                            params.resourceCode.push({
                                trainCode: this.trainCode,
                                resourceType: 2,
                                resourceCode: item,
                                resourceName: val.knowTitle
                            })
                        }
                    })
                })
            }
            if (this.form.data.model.length) {
                this.form.data.model.forEach(item => {
                    this.modelList.forEach(val => {
                        if (item === val.modelLight) {
                            params.resourceCode.push({
                                trainCode: this.trainCode,
                                resourceType: 3,
                                resourceCode: item,
                                resourceName: val.modelTitle
                            })
                        }
                    })
                })
            }
            train.trainRsEdit(params).then(res => {
                if (res.respType === 1) {
                    this.hideDialog()
                    this.$message.success(this.title === "edit" ? "编辑成功" : "新增成功")
                    this.$emit("success")
                }
            })
        },
        // 处理编辑的数据
        handleEdit() {
            const know = []
            const model = []
            this.rowList.forEach(item => {
                if (item.resourceType === 1) {
                    this.form.data.simulation = item.resourceCode
                } else if (item.resourceType === 2) {
                    know.push(item.resourceCode)
                } else if (item.resourceType === 3) {
                    model.push(item.resourceCode)
                }
            })
            this.form.data.know = know
            this.form.data.model = model
        },
        getKnow() {
            know.getKnowDataList({ pageNum: 1, pageSize: 100000000 }).then(res => {
                if (res.respType === 1) {
                    this.knowList = res.respData.list
                    const arr = []
                    res.respData?.list?.forEach(item => {
                        arr.push({
                            dictLabel: item.knowTitle,
                            dictValue: item.knowCode
                        })
                    })
                    this.form.enums.knowList = arr
                }
            })
            model.getModelDataList({ pageNum: 1, pageSize: 100000000 }).then(res => {
                if (res.respType === 1) {
                    this.modelList = res.respData.list
                    const arr = []
                    res.respData?.list?.forEach(item => {
                        arr.push({
                            dictLabel: item.modelTitle,
                            dictValue: item.modelLight
                        })
                    })
                    this.form.enums.modelList = arr
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>

</style>
