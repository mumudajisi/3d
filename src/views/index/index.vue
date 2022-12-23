<template>
    <div class="home">
        <!-- <span class="top-font">输入关键字、主题搜索</span> -->
        <el-row class="home-row" :gutter="12">
            <el-col :span="12">
                <HintTable
                    title="待 办 事 项"
                    :column="todoColumn"
                    :data="todoList"
                />
            </el-col>
            <el-col :span="12">
                <HintTable
                    title="公 告"
                    :column="noticeColumn"
                    :data="noticeList"
                />
            </el-col>
        </el-row>
        <DiskTable class="disk-table" :data="diskStatusList">
            <el-table-column prop="path" label="盘符路径" />
            <el-table-column
                prop="fileSystem"
                label="文件系统"
            />
            <el-table-column prop="diskType" label="盘符类型" />
            <el-table-column prop="size" label="总大小" />
            <el-table-column
                prop="availableSize"
                label="可用大小"
            />
            <el-table-column
                prop="haveUsedSize"
                label="已用大小"
            />
            <el-table-column
                prop="haveUsedPercent"
                label="已用百分比"
            />
        </DiskTable>
    </div>
</template>

<script>
import HintTable from "./components/HintTable.vue";
import DiskTable from "./components/DiskTable.vue";

export default {
    name: "Index",
    components: {
        HintTable,
        DiskTable,
    },
    data() {
        return {
            todoColumn: [
                { prop: "id", width: "50px", align: "center" },
                { prop: "title" },
            ],
            noticeColumn: [
                { prop: "id", width: "50px", align: "center" },
                { prop: "title" },
            ],
            todoList: [
                { id: 1, title: "xxx 事项待办" },
                { id: 2, title: "xxx 发来站内消息" },
                { id: 3, title: "xxx 发来站内消息" },
                { id: 4, title: "xxx 发来站内消息" },
                { id: 5, title: "xxx 发来站内消息" },
            ],
            noticeList: [
                { id: 1, title: "1.0版本发布" },
                { id: 2, title: "1.0版本发布" },
                { id: 3, title: "1.0版本发布" },
                { id: 4, title: "1.0版本发布" },
                { id: 5, title: "1.0版本发布" },
            ],
            diskStatusList: [
                {
                    path: "C:\\",
                    fileSystem: "NTFS",
                    diskType: "本地固定磁盘（C:）",
                    size: "99.9GB",
                    availableSize: "38.4GB",
                    haveUsedSize: "38.4GB",
                    haveUsedPercent: "61.56%",
                },
                {
                    path: "C:\\",
                    fileSystem: "NTFS",
                    diskType: "本地固定磁盘（C:）",
                    size: "99.9GB",
                    availableSize: "38.4GB",
                    haveUsedSize: "38.4GB",
                    haveUsedPercent: "61.56%",
                },
                {
                    path: "C:\\",
                    fileSystem: "NTFS",
                    diskType: "本地固定磁盘（C:）",
                    size: "99.9GB",
                    availableSize: "38.4GB",
                    haveUsedSize: "38.4GB",
                    haveUsedPercent: "61.56%",
                },
                {
                    path: "C:\\",
                    fileSystem: "NTFS",
                    diskType: "本地固定磁盘（C:）",
                    size: "99.9GB",
                    availableSize: "38.4GB",
                    haveUsedSize: "38.4GB",
                    haveUsedPercent: "61.56%",
                },
                {
                    path: "C:\\",
                    fileSystem: "NTFS",
                    diskType: "本地固定磁盘（C:）",
                    size: "99.9GB",
                    availableSize: "38.4GB",
                    haveUsedSize: "38.4GB",
                    haveUsedPercent: "61.56%",
                },
            ],
        };
    },
    methods: {},
};
</script>

<style scoped lang="scss">
.home {
    width: 100%;
    padding: 5px;
}
.disk-table {
    margin-top: 10px;
}

</style>
