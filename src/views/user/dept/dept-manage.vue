<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}部门`" width="680px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="90px">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="上级部门" prop="parentId">
                        <treeselect v-model="form.parentId" :options="deptList" :normalizer="normalizer" placeholder="选择上级部门" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="部门名称" prop="deptName">
                        <el-input v-model="form.deptName" placeholder="请输入部门名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="部门代码" prop="deptCode">
                        <el-input v-model="form.deptCode" placeholder="请输入部门名称" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="显示排序" prop="sortNo">
                        <el-input-number v-model="form.sortNo" controls-position="right" :min="0" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="负责人" prop="leader">
                        <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="联系电话" prop="phone">
                        <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="部门状态">
                        <el-radio-group v-model="form.status">
                            <el-radio :label="1">正常</el-radio>
                            <el-radio :label="0">停用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { dept } from "@/api";

export default {
    name: "DeptManage",
    components: {
        Treeselect,
    },
    props: {
        type: {
            type: String,
            default: "add",
        },
        row: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            loading: false,
            deptList: [],
            form: {
                parentId: 0,
                deptName: "",
                deptCode: "",
                sortNo: 0,
                leader: "",
                phone: "",
                email: "",
                status: 1,
            },
            rules: {
                parentId: [{ required: true, message: "上级部门不能为空", trigger: "blur" }],
                deptName: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
                deptCode: [{ required: true, message: "部门代码不能为空", trigger: "blur" }],
                sortNo: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
                email: [
                    {
                        type: "email",
                        message: "请输入正确的邮箱地址",
                        trigger: ["blur", "change"],
                    },
                ],
                phone: [
                    {
                        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                        message: "请输入正确的手机号码",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    computed: {
        titleText() {
            return {
                add: "添加",
                edit: "修改",
            }[this.type];
        },
    },
    methods: {
        /** 转换菜单数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.deptId,
                label: node.deptName,
                children: node.children,
            };
        },
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    this.loading = true;
                    try {
                        const { deptId, deptName, sortNo, leader, phone, email, status, parentId, deptCode } = this.form;
                        if (this.type === "add") {
                            await dept.addDept({ deptName, sortNo, leader, phone, email, status, parentId, deptCode });
                        } else {
                            await dept.updateDept({ deptId, deptName, sortNo, leader, phone, email, status, parentId, deptCode });
                        }
                        this.cancel();
                        this.$emit("success");
                        this.$modal.msgSuccess(`${this.titleText}成功`);
                    } catch (error) {
                        console.log(error);
                    } finally {
                        this.loading = false;
                    }
                }
            });
        },
        // 取消按钮
        cancel() {
            this.$emit("update:visible", false);
            this.reset();
        },
        // 表单重置
        reset() {
            this.form = {
                parentId: 0,
                deptName: "",
                deptCode: "",
                sortNo: 0,
                leader: "",
                phone: "",
                email: "",
                status: 1,
            };
            this.resetForm("form");
        },
        async getDeptList() {
            try {
                const { respData } = await dept.getDeptList();
                this.deptList = [{ deptId: 0, deptName: "主类目", children: this.handleTree(respData || [], "deptId") }];
            } catch (error) {
                console.log(error);
            }
        },
        open() {
            this.getDeptList();
            this.reset();
            this.form = Object.assign(this.form, this.row);
        },
    },
};
</script>
