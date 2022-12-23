<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}角色`" width="550px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-form-item prop="roleKey">
                <span slot="label">
                    <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                        <i class="el-icon-question" />
                    </el-tooltip>
                    角色代码
                </span>
                <el-input v-model="form.roleKey" placeholder="请输入角色代码" />
            </el-form-item>
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="form.roleName" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="角色顺序" prop="roleSort">
                <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                    <el-radio :label="1">正常</el-radio>
                    <el-radio :label="0">停用</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="菜单权限">
                <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand">展开/折叠</el-checkbox>
                <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll">全选/全不选</el-checkbox>
                <el-checkbox v-model="menuCheckStrictly" @change="handleCheckedTreeConnect">父子联动</el-checkbox>
                <div class="treebox">
                    <el-tree
                        ref="menu"
                        :data="menuOptions"
                        show-checkbox
                        node-key="menuId"
                        :check-strictly="!menuCheckStrictly"
                        empty-text="加载中，请稍候"
                        :props="defaultProps"
                        :default-expand-all="isExpandAll"
                    />
                </div>
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { menu, role } from "@/api";

export default {
    name: "RoleManage",
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
            form: {
                roleName: "",
                roleKey: "",
                roleSort: "",
                status: 1,
                remark: "",
            },
            loading: false,
            menuCheckStrictly: true,
            isExpandAll: true,
            rules: {
                roleKey: [{ required: true, message: "角色代码不能为空", trigger: "blur" }],
                roleName: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
                roleSort: [{ required: true, message: "角色顺序不能为空", trigger: "blur" }],
            }, // 数据范围选项
            dataScopeOptions: [
                {
                    value: "1",
                    label: "全部数据权限",
                },
                {
                    value: "2",
                    label: "自定数据权限",
                },
                {
                    value: "3",
                    label: "本部门数据权限",
                },
                {
                    value: "4",
                    label: "本部门及以下数据权限",
                },
                {
                    value: "5",
                    label: "仅本人数据权限",
                },
            ],
            menuExpand: true,
            // 菜单列表
            menuOptions: [],
            menuNodeAll: false,
            defaultProps: {
                children: "children",
                label: "menuName",
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
    created() {},
    methods: {
        // 树权限（展开/折叠）
        handleCheckedTreeExpand(value) {
            const treeList = this.menuOptions;
            for (let i = 0; i < treeList.length; i++) {
                this.$refs.menu.store.nodesMap[treeList[i].menuId].expanded = value;
            }
        },
        // 树权限（全选/全不选）
        handleCheckedTreeNodeAll(value) {
            this.handleCheckedTreeConnect(true);
            this.$nextTick(() => {
                this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
            });
        },
        // 树权限（父子联动）
        handleCheckedTreeConnect(value) {
            this.menuCheckStrictly = !!value;
        },
        // 所有菜单节点数据
        getMenuAllCheckedKeys() {
            // 目前被选中的菜单节点
            const checkedKeys = this.$refs.menu.getCheckedKeys();
            // 半选中的菜单节点
            const halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys();
            checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
            return checkedKeys;
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const menus = this.getMenuAllCheckedKeys();
                        const { roleId, roleKey, roleName, roleSort, remark } = this.form;
                        if (roleId !== undefined) {
                            await role.updateRole({ roleId, roleKey, roleName, roleSort, remark, menus });
                        } else {
                            await role.addRole({ roleKey, roleName, roleSort, remark, menus });
                        }
                        this.$modal.msgSuccess("新增成功");
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
            if (this.$refs.menu !== undefined) {
                this.$refs.menu.setCheckedKeys([]);
            }
            this.menuExpand = true;
            this.menuNodeAll = false;
            this.form = {
                roleName: "",
                roleKey: "",
                roleSort: "",
                status: 1,
                remark: "",
            };
            this.menuCheckStrictly = this.type === "add";
            this.resetForm("form");
        },
        getMenuIds(list) {
            let ids = [];
            list.forEach((item) => {
                ids.push(item.menuId);
                const childIds = this.getMenuIds(item.children || []);
                ids = [...ids, ...childIds];
            });
            return ids;
        },
        async getRoleMenuIds() {
            if (this.type === "add") return;
            try {
                const { respData } = await menu.getRoleMenuIds(this.row.roleKey);
                const ids = this.getMenuIds(respData || []);
                this.$refs.menu.setCheckedKeys(ids);
            } catch (error) {
                console.log(error);
            }
        },
        open() {
            this.getRoleMenuIds();
            this.getMenuTreeselect();
            this.reset();
            this.form = Object.assign(this.form, this.row);
        },
        /** 查询菜单树结构 */
        async getMenuTreeselect() {
            try {
                const { respData } = await menu.getMenuList();
                this.menuOptions = this.handleTree(respData || [], "menuId");
            } catch (error) {
                console.log(error);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.treebox {
    width: 100%;
    max-height: 250px;
    margin-top: 5px;
    border: 1px solid #e5e6e7;
    background: #ffffff none;
    border-radius: 4px;
    overflow-y: auto;
    & > * {
        line-height: normal;
    }
}
</style>
