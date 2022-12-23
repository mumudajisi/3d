<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}用户`" width="640px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-row v-if="type === 'add'">
                <el-col :span="12">
                    <el-form-item label="用户账号" prop="userId">
                        <el-input v-model="form.userId" placeholder="请输入用户账号" maxlength="30" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="用户密码" prop="password">
                        <el-input
                            v-model="form.password" placeholder="请输入用户密码" auto-complete="new-password" maxlength="20" type="password"
                            disabled
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="用户名称" prop="userName">
                        <el-input v-model="form.userName" placeholder="请输入用户名称" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="用户性别">
                        <BaseSelect ref="baseSelect" v-model="form.sex" type="person_sex" placeholder="请选择性别" clearable />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="手机号码" prop="mobile">
                        <el-input v-model="form.mobile" placeholder="请输入手机号码" maxlength="11" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" clearable />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <!--                <el-col :span="12">-->
                <!--                    <el-form-item label="归属部门" prop="dept">-->
                <!--                        <treeselect-->
                <!--                            v-model="form.dept"-->
                <!--                            :options="deptOptions"-->
                <!--                            :normalizer="normalizer"-->
                <!--                            :show-count="true"-->
                <!--                            placeholder="请选择归属部门"-->
                <!--                        />-->
                <!--                    </el-form-item>-->
                <!--                </el-col>-->
                <!--                <el-col :span="12">-->
                <!--                    <el-form-item label="所属岗位">-->
                <!--                        <el-select v-model="form.position" placeholder="请选择岗位" clearable>-->
                <!--                            <el-option v-for="item in postNoDisList" :key="item.postId" :label="item.postName" :value="item.postId" />-->
                <!--                        </el-select>-->
                <!--                    </el-form-item>-->
                <!--                </el-col>-->
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="状态">
                        <el-radio-group v-model="form.status">
                            <el-radio :label="1">正常</el-radio>
                            <el-radio :label="0">停用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="角色">
                        <el-select v-model="form.roles" multiple placeholder="请选择角色" clearable>
                            <el-option v-for="item in roleNoDisList" :key="item.roleId" :label="item.roleName" :value="item.roleId" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="备注">
                        <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" clearable />
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
// import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { role, post, user } from "@/api";
import { getAttrsByKeys } from "@/utils";

export default {
    name: "UserManage",
    // components: { Treeselect },
    props: {
        type: {
            type: String,
            default: "add",
        },
        row: {
            type: Object,
            default: () => ({}),
        },
        deptOptions: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            loading: false,
            form: {
                id: undefined,
                userId: "",
                dept: undefined,
                userName: "",
                password: "123456",
                mobile: "",
                email: "",
                sex: "1",
                status: 1,
                remark: "",
                position: "",
                roles: [],
            },
            defaultSex: "",
            roleList: [],
            postList: [],
            rules: {
                userId: [
                    { required: true, message: "用户账号不能为空", trigger: "blur" },
                    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" },
                ],
                userName: [{ required: true, message: "用户名称不能为空", trigger: "blur" }],
                password: [
                    { required: true, message: "用户密码不能为空", trigger: "blur" },
                    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
                ],
                email: [
                    {
                        type: "email",
                        message: "请输入正确的邮箱地址",
                        trigger: ["blur", "change"],
                    },
                ],
                mobile: [
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
        roleNoDisList() {
            return this.roleList.filter((item) => item.status === 1);
        },
        postNoDisList() {
            return this.postList.filter((item) => item.status === 1);
        },
    },
    methods: {
        /** 菜单数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.id,
                label: node.name,
                children: node.children,
            };
        },
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, userId, ...otherForm } = getAttrsByKeys(
                            this.form,
                            "id,userId,dept,userName,mobile,email,sex,status,remark,position,roles,deptName"
                        );
                        if (this.type === "add") {
                            await user.addUser({ userId, ...otherForm });
                        } else {
                            await user.updateUser({ id, userId, ...otherForm });
                        }
                        this.$modal.msgSuccess(`${this.titleText}成功`);
                        this.cancel();
                        this.$emit("success");
                    } catch (error) {
                        console.log(error);
                    } finally {
                        this.loading = false;
                    }
                }
            });
        },
        cancel() {
            this.$emit("update:visible", false);
            this.reset();
        },
        // 表单重置
        reset() {
            this.form = {
                userId: "",
                dept: undefined,
                userName: "",
                password: "123456",
                mobile: "",
                email: "",
                sex: "1",
                status: 1,
                remark: "",
                position: "",
                roles: [2],
            };
            this.resetForm("form");
        },
        async getRoleList() {
            try {
                const { respData } = await role.getRoleList({
                    pageNo: 1,
                    pageSize: 5000,
                });
                this.roleList = respData.list || [];
            } catch (error) {
                console.log(error);
            }
        },
        async getPostList() {
            try {
                const { respData } = await post.getPostList({
                    pageNo: 1,
                    pageSize: 5000,
                });
                this.postList = respData.list || [];
            } catch (error) {
                console.log(error);
            }
        },
        async getRolesById(id) {
            try {
                const { respData } = await user.getRolesById(id);
                this.form.roles = respData || [];
            } catch (error) {
                console.log(error);
            }
        },
        open() {
            this.getRoleList();
            this.getPostList();
            this.reset();
            this.form = Object.assign(this.form, this.row);
            if (this.type === "edit") {
                this.getRolesById(this.form.id);
            }
        },
    },
};
</script>

<style lang="scss" scoped></style>
