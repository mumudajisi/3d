<template>
    <Wrap>
        <Row>
            <Aside>
                <template #tree>
                    <div class="tree">
                        <TreeSearch ref="treeSearch" :data="treeList" :props="{ label: 'name' }" accordion node-key="id" :default-expanded-keys="treeData" @node-click="onNodeClick" />
                    </div>
                </template>
            </Aside>
            <Main>
                <div class="search">
                    <el-input v-model="chooseName" class="type" readonly>
                        <i slot="suffix" class="el-input__icon el-icon-circle-close" @click="clear" />
                    </el-input>
                    <el-input v-model="form.modelTitle" class="input" clearable @keyup.enter.native="getList" />
                    <el-button class="button" icon="el-icon-search" @click="getList">搜索</el-button>
                    <el-button class="reset" icon="el-icon-refresh" @click="reset">重置</el-button>
                </div>
                <div class="tootip">共检索到 {{ paging.total }} 条记录，当前显示 {{ currentShow }} 条</div>
                <div class="container">
                    <div class="search-list">
                        <template v-for="(item, i) in resultList">
                            <div :key="i" class="search-list-item" @click="onItemClick(item)">
                                {{ item.know }}
                                <el-image class="search-list-item__img" :src="imgUrl+item.modelIcon" />
                                <div class="search-list-item__container" @click.stop>
                                    <div class="title">{{ item.modelTitle }}</div>
                                    <!--                                    <div class="type">{{ item.modelMode }}</div>-->
                                </div>
                            </div>
                        </template>
                    </div>
                    <pagination class="pagination" :total="paging.total" :page.sync="paging.pageNum" :limit.sync="paging.pageSize" @pagination="getList" />
                </div>
            </Main>
        </Row>
    </Wrap>
</template>

<script>
import Aside from "@/components/Aside/Aside.vue";
import Wrap from "@/components/Wrap/Wrap.vue";
import Main from "@/components/Main/Main.vue";
import Row from "@/components/Row/Row.vue";
import TreeSearch from "@/components/TreeSearch/TreeSearch.vue";
import { model } from "@/api"
export default {
    name: "ModelLibrary",
    components: { Aside, TreeSearch, Wrap, Main, Row },
    data() {
        return {
            imgUrl: process.env.VUE_APP_RESOURCE_SERVER,
            form: {
                modelTitle: "",
                modelTypeId: "",
            },
            chooseName: "",
            paging: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
            },
            treeList: [],
            resultList: [],
            treeData: [],
        };
    },
    computed: {
        currentShow() {
            const { pageNum: page, pageSize: size, total } = this.paging;
            const begin = (page - 1) * size + 1;
            return total > 1 ? `${begin}-${begin + this.resultList.length - 1}` : total;
        },
    },
    created() {
        this.getTree();
        this.getList();
    },
    methods: {
        clear() {
            this.form.modelTypeId = "";
            this.chooseName = "";
            this.$refs["treeSearch"].clearChoseStyle();
        },

        reset() {
            this.form = {
                modelTitle: "",
                modelTypeId: "",
            }
            this.chooseName = "";
            this.$refs["treeSearch"].clearChoseStyle();
            this.getList()
        },
        // 模型
        onItemClick(item) {
            this.$amberBuried({
                postScript: "模型",
                resourceId: item.id,
                scoreMode: 12,
                scoreType: 1,
                remark: item.modelTitle
            })
            this.$loading({ text: "加载中" })
            const params = {
                ftpId: 1,
                id: item.id,
                modelCode: item.modelLight,
            }
            model.webUnzipModel(params).then(res => {
                if (res.respType === 1) {
                    window.open(process.env.VUE_APP_RESOURCE_SERVER + res.respData, "_blank")
                    this.$loading().close()
                }
            }).catch(err => {
                console.log(err)
                this.$loading().close()
            })
        },

        onNodeClick(data) {
            this.chooseName = data.name;
            this.form.modelTypeId = data.id;
            this.getList();
        },

        async getList() {
            try {
                const { respData: { page }} = await model.getList({
                    ...this.paging,
                    ...this.form,
                })
                this.resultList = page.list || [];
                this.paging.total = page.total || 0;
            } catch (error) {
                console.log(error);
            }
        },
        async getTree() {
            try {
                const { respData } = await model.getTree()
                this.treeList = respData || [];
                this.treeList.forEach(element => {
                    this.treeData.push(element.id)
                });
            } catch (error) {
                console.log(error);
            }
        },
    }
};
</script>

<style lang="scss" scoped>
.search {
    display: flex;
    justify-content: center;
    .type {
        width: 160px;
        input {
            border-radius: 0 !important;
            padding-left: 8px;
        }
        .el-icon-circle-close {
            cursor: pointer;
        }

    }
    .input {
        width: 500px;
        input {
            border-radius: 0 !important;
        }
    }
    .button {
        border-radius: 1px !important;
        background-color: #006e6b;
        border: 1px solid #006e6b;
        color: #fff;
        &:hover {
            background-color: rgba(41, 133, 131, 1);
        }
        &:active {
            background-color: rgba(0, 97, 94, 1);
        }
    }
}
.tootip {
    border-bottom: 1px solid #dcdfe6;
    padding: 15px 15px 5px;
    color: #888;
}
.container {
    padding: 0 15px;
    .search-list {
        width: 100%;
        padding: 15px 0;
        display: flex;
        flex-wrap: wrap;
        &-item {
            width: 280px;
            margin-bottom: 10px;
            margin-right: 15px;
            cursor: pointer;
            &__img {
                width: 100%;
                height: 188px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(0, 0, 0, 0.04);
            }
            &__container {
                height: calc(100% - 188px);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #888;
                .title {
                    color: #888;
                    font-size: 12px;
                }
                //.type {
                //    min-width: 45px;
                //    height: 20px;
                //    text-align: right;
                //    padding: 0 6px 0 12px;
                //    background-image: url("~@/assets/images/mode-type.png");
                //    background-size: 100%;
                //    background-repeat: no-repeat;
                //}
            }
        }
    }
}
.pagination {
    margin-bottom: 25px;
}
</style>
