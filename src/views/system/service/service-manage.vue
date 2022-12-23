<template>
    <el-dialog v-bind="$attrs" :title="`${titleText}服务`" width="500px" :close-on-click-modal="false" append-to-body v-on="$listeners" @open="open">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="业务代码" prop="busiCode">
                <el-input v-model="form.busiCode" placeholder="请输入业务代码" />
            </el-form-item>
            <el-form-item label="服务代码" prop="tranCode">
                <el-input v-model="form.tranCode" placeholder="请输入服务代码" />
            </el-form-item>
            <el-form-item label="服务名称" prop="tranName">
                <el-input v-model="form.tranName" placeholder="请输入服务名称" />
            </el-form-item>
            <el-form-item label="服务路径" prop="tranPath">
                <el-input v-model="form.tranPath" placeholder="请输入服务路径" />
            </el-form-item>
            <el-form-item label="服务id" prop="serverId">
                <el-input v-model="form.serverId" placeholder="请输入服务id" />
            </el-form-item>
            <el-form-item label="开放日期" prop="tranDate">
                <el-date-picker v-model="form.tranDate" type="date" value-format="yyyy-MM-dd" style="width: 100%" placeholder="请选择开放日期" />
            </el-form-item>
            <el-form-item label="开放时间" prop="tranOpen">
                <el-time-picker v-model="form.tranOpen" placeholder="请选择开放时间" value-format="hh:mm:ss" style="width: 100%" />
            </el-form-item>
            <el-form-item label="关闭时间" prop="tranDown">
                <el-time-picker v-model="form.tranDown" placeholder="请选择关闭时间" value-format="hh:mm:ss" style="width: 100%" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="form.status">
                    <el-radio :label="1">正常</el-radio>
                    <el-radio :label="0">停用</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { service } from "@/api";
import { getAttrsByKeys } from "@/utils";

export default {
    name: "ServiceManage",
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
            form: {
                id: "",
                busiCode: "",
                tranCode: "",
                tranName: "",
                tranPath: "",
                serverId: "",
                tranDate: "",
                tranOpen: "",
                tranDown: "",
                status: 1,
            },
            roleList: [],
            postList: [],
            rules: {
                busiCode: [{ required: true, message: "业务代码不能为空", trigger: "blur" }],
                tranCode: [{ required: true, message: "服务代码不能为空", trigger: "blur" }],
                tranName: [{ required: true, message: "服务名称不能为空", trigger: "blur" }],
                tranPath: [{ required: true, message: "服务路径不能为空", trigger: "blur" }],
                serverId: [{ required: true, message: "服务id不能为空", trigger: "blur" }],
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
        submitForm() {
            this.$refs["form"].validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true;
                        const { id, tranCode, tranName, tranDate, busiCode, ...otherForm } = getAttrsByKeys(
                            this.form,
                            "id,busiCode,tranCode,tranName,tranPath,serverId,tranDate,tranOpen,tranDown,status"
                        );
                        if (this.type === "add") {
                            await service.addTran({
                                transCode: tranCode,
                                transName: tranName,
                                transDate: tranDate,
                                bizCode: busiCode,
                                ...otherForm,
                            });
                        } else {
                            await service.updateTran({
                                id,
                                transCode: tranCode,
                                transName: tranName,
                                transDate: tranDate,
                                bizCode: busiCode,
                                ...otherForm,
                            });
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
                id: "",
                busiCode: "",
                tranCode: "",
                tranName: "",
                tranPath: "",
                serverId: "",
                tranDate: "",
                tranOpen: "",
                tranDown: "",
                status: 1,
            };
            this.resetForm("form");
        },
        open() {
            this.reset();
            this.form = Object.assign(this.form, this.row);
        },
    },
};
</script>
