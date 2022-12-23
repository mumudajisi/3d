<template>
    <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :title="title === 'edit' ? '编辑题库' : '新增题库'"
        destroy-on-close
        visible
        width="800px"
        @close="hideDialog"
    >
        <BaseForm
            ref="refForm"
            v-model="form.data"
            ref-form="refForm"
            :config="form.config"
            :enums="form.enums"
            :other-config="form.otherConfig"
        >
            <template v-for="(titleItem,index) in form.titleItems" slot="slotName">
                <div :key="index" style="margin-top:15px">
                    <span style="margin-left:-39px;font-size:14px;color:#606266;font-weight:700">标题</span><el-input v-model="titleItem.name" placeholder="输入标题" style="width: 85% ;margin-left:10px" />
                    <el-button type="text" style="margin-left: 10px" size="mini">
                        添加题目
                    </el-button>
                    <el-button type="text" @click="form.titleItems.splice(index,1)"><span style="color:red">删除</span></el-button>
                </div>
            </template>
        </BaseForm>
        <PaperTopic v-if="Visiable" ref="dialog" />
        <span slot="footer">
            <el-button @click="hideDialog">取 消</el-button>
            <el-button type="primary" @click="submit">确 定</el-button>
        </span>
    </el-dialog>
</template>
<script>
import BaseForm from "@/components/BaseFormNew";
import bankApi from "@/api/bank.js"
import PaperTopic from "@/views/exam/paper/components/PaperTopic";
export default {
    name: "AddPaper",
    components: { BaseForm, PaperTopic },
    props: {
        hideDialog: {
            type: Function,
            default() {
                return () => {};
            },
        },
        title: {
            type: String,
            default: "add",
        },
        row: {
            type: Object,
            default() {
                return {}
            },
        },
        tree: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            init: "",
            dialogVisible: false,
            Visiable: false,
            form: {
                titleItems: [],
                otherConfig: {
                    labelWidth: "100px",
                    // disabled: false, // 是否全部禁用
                },
                config: [
                    // {
                    //     col: 24,
                    //     type: "select",
                    //     name: "专业",
                    //     dataList: "paperTypeList",
                    //     placeholder: "请选择专业类别",
                    //     bind: "major",
                    //     trigger: "change",
                    //     required: "请选择专业",
                    //     rules: [],
                    //     callBc: this.callBc,
                    // },
                    // showHide: this.showHide,
                    {
                        col: 12,
                        type: "select",
                        name: "上级题库",
                        dataList: "paperLastTypeList",
                        placeholder: "请选择上级题库",
                        bind: "parentId",
                        isHide: true,
                        showHide: this.showHide,
                        callBc: this.callBc,
                    },
                    // {
                    //     col: 24,
                    //     type: "cascade",
                    //     name: "题库区域",
                    //     placeholder: "请选择题库区域",
                    //     bind: "areaCode",
                    //     trigger: "change",
                    //     dataList: "treeData",
                    //     disabled: this.title === "edit",
                    //     showAllLevels: false, // 只展示最后一级
                    //     rules: [{
                    //         required: true,
                    //         message: "请选择题库区域",
                    //         trigger: "blur",
                    //     }],
                    //     filterable: true,
                    //     props: {
                    //         value: "areaCode",
                    //         label: "name",
                    //         children: "children",
                    //         expandTrigger: "click", // click hover 默认click
                    //         multiple: false, // 是否多选
                    //         checkStrictly: true, // 是否严格的遵守父子节点不互相关联
                    //         emitPath: false, // 在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
                    //         leaf: "areaCode", // 指定选项的叶子节点的标志位为选项对象的某个属性值
                    //     },
                    //     callBc: this.callBc
                    // },
                    {
                        col: 24,
                        type: "text",
                        name: "题库名称",
                        placeholder: "请输入题库名称",
                        bind: "bankName",
                        trigger: "blur",
                        required: "请输入题库名称",
                        rules: [],
                    },
                ],
                enums: {
                    paperTypeList: [],
                    bankTypeList: [],
                    bankCodeList: [], // 上级题库
                    treeData: this.tree, // 区域数
                },
                data: {
                    major: "0", // 专业
                    areaCode: "320000", // 区域代码
                    bankName: "", // 题库标题
                    // parentId: "", // 上级题库
                },
            },
        };
    },
    mounted() {
        if (this.title === "edit") {
            this.form.data = JSON.parse(JSON.stringify(this.row))
        }
        // this.dicList();
    },
    methods: {
        // 提交校验
        async submit() {
            const flg = this.$refs.refForm.validate()
            if (!flg) return false
            const params = {
                ...this.form.data,
                busiCode: "1001",
                tranCode: this.title === "edit" ? 361302 : 361301,
            }
            const bankUrl = this.title === "edit" ? bankApi.libEdit : bankApi.libAdd
            if (this.title === "edit") {
                params.id = this.row.id
            }
            await bankUrl(params).then(res => {
                if (res.respType === 1) {
                    this.$message.success(this.title === "edit" ? "编辑成功" : "新增成功")
                    this.hideDialog()
                    this.$emit("success")
                }
            })
        },
        // // 字典数据
        // async dicList() {
        //     const params = {
        //         typeList: ["topic_type", "major_type"],
        //     };
        //     await dicApi.getDictDataTypes(params).then((res) => {
        //         if (res.respType === 1) {
        //             this.form.enums.paperTypeList = res.respData.major_type;
        //             this.form.enums.bankTypeList = res.respData.topic_type;
        //         }
        //     });
        // },
    },
};
</script>

<style lang="scss" scoped>
.examPaper-class{
    display: inline-block;
}
</style>
