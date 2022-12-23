<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}菜单`" width="680px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="上级菜单">
                        <treeselect
                            v-model="form.parentId"
                            :options="menuOptions"
                            :normalizer="normalizer"
                            :show-count="true"
                            placeholder="选择上级菜单"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="菜单类型" prop="menuType">
                        <el-radio-group v-model="form.menuType">
                            <el-radio label="P">目录</el-radio>
                            <el-radio label="M">菜单</el-radio>
                            <el-radio label="B">按钮</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col v-show="form.menuType !== 'B'" :span="24">
                    <el-form-item label="菜单图标" prop="icon">
                        <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
                            <IconSelect ref="iconSelect" @selected="selected" />
                            <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                                <template v-if="form.icon" #prefix>
                                    <Icon class="el-input__icon" style="height: 32px; width: 16px" :icon="form.icon" />
                                </template>
                                <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                            </el-input>
                        </el-popover>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="菜单名称" prop="menuName">
                        <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="显示排序" prop="orderNum">
                        <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                    </el-form-item>
                </el-col>
                <el-col v-show="form.menuType !== 'B'" :span="12">
                    <el-form-item>
                        <span slot="label">
                            <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                                <i class="el-icon-question" />
                            </el-tooltip>
                            是否外链
                        </span>
                        <el-radio-group v-model="form.isFrame">
                            <el-radio :label="1">是</el-radio>
                            <el-radio :label="0">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col v-show="form.menuType !== 'B'" :span="12">
                    <el-form-item prop="path">
                        <span slot="label">
                            <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                                <i class="el-icon-question" />
                            </el-tooltip>
                            路由地址
                        </span>
                        <el-input v-model="form.path" placeholder="请输入路由地址" />
                    </el-form-item>
                </el-col>
                <el-col v-show="form.menuType === 'M'" :span="12">
                    <el-form-item prop="component">
                        <span slot="label">
                            <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                                <i class="el-icon-question" />
                            </el-tooltip>
                            组件路径
                        </span>
                        <el-input v-model="form.component" placeholder="请输入组件路径" />
                    </el-form-item>
                </el-col>
                <el-col v-show="form.menuType!=='P'" :span="12">
                    <el-form-item>
                        <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
                        <span slot="label">
                            <el-tooltip content="控制器中定义的权限字符" placement="top">
                                <i class="el-icon-question" />
                            </el-tooltip>
                            权限字符
                        </span>
                    </el-form-item>
                </el-col>
                <el-col v-show="form.menuType === 'M'" :span="12">
                    <el-form-item>
                        <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" />
                        <span slot="label">
                            <el-tooltip content="访问路由的默认传递参数，如：`{&quot;id&quot;: 1, &quot;name&quot;: &quot;ry&quot;}`" placement="top">
                                <i class="el-icon-question" />
                            </el-tooltip>
                            路由参数
                        </span>
                    </el-form-item>
                </el-col>
                <el-col v-show="form.menuType === 'M'" :span="12">
                    <el-form-item>
                        <span slot="label">
                            <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                                <i class="el-icon-question" />
                            </el-tooltip>
                            是否缓存
                        </span>
                        <el-radio-group v-model="form.isCache">
                            <el-radio :label="1">缓存</el-radio>
                            <el-radio :label="0">不缓存</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col v-show="form.menuType !== 'B'" :span="12">
                    <el-form-item>
                        <span slot="label">
                            <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                                <i class="el-icon-question" />
                            </el-tooltip>
                            显示状态
                        </span>
                        <el-radio-group v-model="form.visible">
                            <el-radio label="1">显示</el-radio>
                            <el-radio label="0">隐藏</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col v-show="form.menuType !== 'B'" :span="12">
                    <el-form-item>
                        <span slot="label">
                            <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                                <i class="el-icon-question" />
                            </el-tooltip>
                            菜单状态
                        </span>
                        <el-radio-group v-model="form.status">
                            <el-radio label="1">正常</el-radio>
                            <el-radio label="0">停用</el-radio>
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
import IconSelect from "@/components/IconSelect";
import Icon from "@/components/Icon/Icon.vue";
import { menu } from "@/api";

export default {
    name: "MenuManage",
    components: {
        Treeselect,
        IconSelect,
        Icon,
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
        const validator = (rule, value, callback) => {
            if (!value && this.form.menuType === "M") {
                callback(new Error("路由地址不能为空"));
            } else {
                callback();
            }
        };
        return {
            loading: false,
            form: {
                parentId: 0,
                menuType: "M",
                icon: "",
                menuName: "",
                orderNum: 0,
                isFrame: 0,
                path: "",
                component: "",
                perms: "",
                query: "",
                isCache: 0,
                visible: "1",
                status: "1",
                remark: "",
                menuId: undefined,
            },
            menuOptions: [],
            // 表单校验
            rules: {
                menuName: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
                orderNum: [{ required: true, message: "菜单顺序不能为空", trigger: "blur" }],
                path: [{ required: true, validator, trigger: "blur" }],
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
        // 选择图标
        selected(name) {
            this.form.icon = name;
        },
        /** 转换菜单数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.menuId,
                label: node.menuName,
                children: node.children,
            };
        },
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { menuId, ...otherForm } = this.form;
                        if (this.type === "add") {
                            await menu.addMenu({ ...otherForm });
                        } else {
                            await menu.updateMenu({ menuId, ...otherForm });
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
                menuType: "M",
                icon: "",
                menuName: "",
                orderNum: 0,
                isFrame: 0,
                path: "",
                component: "",
                perms: "",
                query: "",
                isCache: 0,
                visible: "1",
                status: "1",
                remark: "",
                menuId: undefined,
            };
            this.resetForm("form");
        },
        open() {
            this.getMenuList();
            this.reset();
            this.form = Object.assign(this.form, this.row);
        },
        async getMenuList() {
            try {
                const { respData } = await menu.getMenuList();
                this.menuOptions = [{ menuId: 0, menuName: "主类目", children: this.handleTree(respData || [], "menuId") }];
            } catch (error) {
                console.log(error);
            }
        },
    },
};
</script>

<style lang="scss" scoped></style>
