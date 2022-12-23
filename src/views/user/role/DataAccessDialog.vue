<template>
    <el-dialog v-bind="$attrs" width="500px" append-to-body v-on="$listeners" @open="open">
        <el-form :model="form" label-width="80px">
            <el-form-item label="角色代码">
                <el-input v-model="form.roleKey" disabled />
            </el-form-item>
            <el-form-item label="角色名称">
                <el-input v-model="form.roleName" disabled />
            </el-form-item>
            <el-form-item label="权限范围">
                <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
                    <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item v-show="form.dataScope == 2" label="数据权限">
                <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand">展开/折叠</el-checkbox>
                <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll">全选/全不选</el-checkbox>
                <el-checkbox v-model="deptCheckStrictly" @change="handleCheckedTreeConnect">父子联动</el-checkbox>
                <el-tree
                    ref="dept"
                    class="tree-border"
                    :data="deptList"
                    show-checkbox
                    default-expand-all
                    node-key="deptId"
                    :check-strictly="!deptCheckStrictly"
                    empty-text="加载中，请稍候"
                    :props="defaultProps"
                />
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="loading" @click="submitDataScope">确 定</el-button>
            <el-button @click="cancelDataScope">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { dept, role } from "@/api";

export default {
    name: "DataAccessDialog",
    props: {
        row: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            loading: false,
            form: {
                roleId: "",
                roleKey: "",
                roleName: "",
                dataScope: 1,
            },
            deptExpand: true,
            deptNodeAll: false,
            // 部门列表
            deptList: [],
            defaultProps: {
                children: "children",
                label: "deptName",
            },
            deptCheckStrictly: true,
            // 数据范围选项
            dataScopeOptions: [
                {
                    value: 1,
                    label: "全部数据权限",
                },
                {
                    value: 2,
                    label: "自定数据权限",
                },
                {
                    value: 3,
                    label: "本部门数据权限",
                },
                {
                    value: 4,
                    label: "本部门及以下数据权限",
                },
                {
                    value: 5,
                    label: "仅本人数据权限",
                },
            ],
        };
    },
    methods: {
        /** 选择角色权限范围触发 */
        dataScopeSelectChange(value) {
            if (value !== 2) {
                this.$refs.dept.setCheckedKeys([]);
            } else {
                this.getDeptList();
            }
        },
        async getDeptList() {
            try {
                const { respData } = await dept.getDeptList({
                    status: 1,
                });
                this.deptList = this.handleTree(respData || [], "deptId");
            } catch (error) {
                console.log(error);
            }
        },
        // 树权限（展开/折叠）
        handleCheckedTreeExpand(value) {
            const treeList = this.deptList;
            for (let i = 0; i < treeList.length; i++) {
                this.$refs.dept.store.nodesMap[treeList[i].deptId].expanded = value;
            }
        },
        // 树权限（全选/全不选）
        handleCheckedTreeNodeAll(value) {
            this.handleCheckedTreeConnect(true);
            this.$nextTick(() => {
                this.$refs.dept.setCheckedNodes(value ? this.deptList : []);
            });
        },
        // 树权限（父子联动）
        handleCheckedTreeConnect(value) {
            this.deptCheckStrictly = !!value;
        } /** 提交按钮（数据权限） */,
        submitDataScope: function () {
            if (this.form.roleId !== undefined) {
                this.form.deptIds = this.getDeptAllCheckedKeys();
                role.dataScope(this.form).then((response) => {
                    this.$modal.msgSuccess("修改成功");
                    this.openDataScope = false;
                    this.getList();
                });
            }
        },
        // 取消按钮（数据权限）
        cancelDataScope() {
            this.$emit("update:visible", false);
            this.reset();
        },
        // 表单重置
        reset() {
            this.deptExpand = true;
            this.deptNodeAll = false;
            this.form = {
                roleId: "",
                roleKey: "",
                roleName: "",
                dataScope: 1,
            };
            this.resetForm("form");
        },
        open() {
            this.form = Object.assign({}, this.row);
        },
    },
};
</script>

<style lang="scss" scoped></style>
