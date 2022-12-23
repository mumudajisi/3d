<template>
    <div class="login-log">
        <base-form size="small" :model="form" show-search :components="components" @search="getList" />
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                    type="danger" icon="el-icon-delete" size="mini" :disabled="selection.length <= 0" @click="deleteLog"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="clearLog">清空</el-button>
            </el-col>
            <!-- <el-col :span="1.5">
                <el-button type="warning" icon="el-icon-download" size="mini">导出</el-button>
            </el-col> -->
        </el-row>
        <base-table v-loading="loading" :data="loginLogList" :columns="columns" @selection-change="handleSelectionChange" />
        <pagination :total="paging.total" :page.sync="paging.pageNo" :limit.sync="paging.pageSize" @pagination="getList" />
    </div>
</template>

<script>
import BaseForm from "@/components/BaseForm/BaseForm.vue";
import BaseTable from "@/components/BaseTable/BaseTable.vue";
import { log } from "@/api";

export default {
    name: "LoginLog",
    components: { BaseForm, BaseTable },
    data() {
        return {
            form: {
                ipaddr: "",
                userName: "",
                status: "",
                date: [],
                loginIp: "",
                userId: ""
            },
            components: [],
            loginLogList: [],
            columns: [],
            loading: false,
            paging: {
                total: 0,
                pageNo: 1,
                pageSize: 20,
            },
            selection: [],
        };
    },
    created() {
        this.initCom();
        this.initColumn();
    },
    methods: {
        deleteLog() {
            const ids = this.selection.map((item) => item.id);
            const message = "是否确认批量删除选中的登录日志数据项？";
            this.$modal.confirm(message).then(async () => {
                try {
                    await log.deleteLoginLog({ ids: ids });
                    await this.getList();
                    this.selection = [];
                    this.$modal.msgSuccess("删除登录日志成功");
                } catch (error) {
                    console.log(error);
                }
            });
        },
        clearLog() {
            const message = "是否确认清空所有登陆日志数据项？";
            this.$modal.confirm(message).then(async () => {
                try {
                    await log.clearLoginLog();
                    await this.getList();
                    this.selection = [];
                    this.$modal.msgSuccess("清空登录日志成功");
                } catch (error) {
                    console.log(error);
                }
            });
        },
        // 多选框选中数据
        handleSelectionChange(value) {
            this.selection = value;
        },
        showDetail(row) {
        },
        async getList() {
            try {
                this.loading = true;
                const { respData } = await log.getLoginLogList({
                    pageNum: this.paging.pageNo,
                    pageSize: this.paging.pageSize,
                    userId: this.form.userId,
                    loginIp: this.form.loginIp,
                    startTime: (this.form.date && this.form.date[0]) || "",
                    endedTime: (this.form.date && this.form.date[1]) || "",
                    status: this.form.status,
                });
                this.loginLogList = respData.list || [];
                this.paging.total = respData.total || 0;
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        initCom() {
            this.components = [
                {
                    label: "登陆地址：",
                    prop: "loginIp",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入登陆地址",
                    },
                },
                {
                    label: "用户名称：",
                    prop: "userId",
                    component: "el-input",
                    componentProp: {
                        placeholder: "请输入用户名称",
                    },
                },
                {
                    component: "BaseSelect",
                    label: "状态：",
                    prop: "status",
                    componentProp: {
                        width: "140px",
                        placeholder: "登陆状态",
                        type: "component_status",
                    },
                    on: {
                        finished: () => {
                            this.getList();
                        },
                    },
                },
                {
                    component: "el-date-picker",
                    label: "创建时间：",
                    prop: "date",
                    componentProp: {
                        width: "250px",
                        type: "daterange",
                        startPlaceholder: "开始日期",
                        endPlaceholder: "结束日期",
                        valueFormat: "yyyy-MM-dd",
                    },
                },
            ];
        },
        initColumn() {
            this.columns = [
                { type: "selection", width: 50, align: "center" },
                { label: "访问编号", prop: "id", width: 100, align: "center" },
                { label: "用户名称", prop: "userId", width: 100, align: "center" },
                { label: "登陆地址", prop: "loginIp", width: 150, align: "center" },
                { label: "IP归属地", prop: "ipAddr", width: 150, align: "center" },
                { label: "登陆模式", prop: "loginMode", width: 180, align: "center" },
                { label: "浏览器", prop: "browser", width: 180, align: "center" },
                { label: "操作系统", prop: "loginOs", width: 180, align: "center" },
                {
                    label: "登陆状态",
                    prop: "status",
                    width: 80,
                    align: "center",
                    render: (h, { row }) => {
                        return h(
                            "el-tag",
                            {
                                props: { type: row.status === 0 ? "danger" : "" },
                            },
                            ["登陆失败", "登陆成功", "", "登出成功"][row.status]
                        );
                    },
                },
                { label: "操作信息", prop: "message", align: "center" },
                { label: "登陆日期", prop: "loginTime", width: 200, align: "center" },
            ];
        },
    },
};
</script>

<style lang="scss" scoped></style>
