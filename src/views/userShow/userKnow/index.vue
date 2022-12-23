<template>
    <Wrap>
        <Row>
            <Aside>
                <template #tree>
                    <div class="tree">
                        <TreeSearch ref="treeSearch" :data="treeList" accordion :props="defaultProps" node-key="id" :default-expanded-keys="treeData" @node-click="onNodeClick" />
                    </div>
                </template>
            </Aside>
            <Main>
                <div class="search">
                    <el-input v-model="chooseName" class="type" readonly>
                        <i slot="suffix" class="el-input__icon el-icon-circle-close" @click="clear" />
                    </el-input>
                    <el-input v-model="form.knowTitle" class="input" clearable @keyup.enter.native="getList" />
                    <el-button class="button" icon="el-icon-search" @click="getList">搜索</el-button>
                    <el-button class="reset" icon="el-icon-refresh" @click="reset">重置</el-button>
                </div>
                <div class="tootip">共检索到 {{ paging.total }} 条记录，当前显示 {{ currentShow }} 条</div>
                <div class="container">
                    <div class="search-list-wrapper">
                        <div class="search-list">
                            <template v-for="(item, i) in resultList">
                                <div :key="i" class="search-list-item">
                                    <el-image class="search-list-item__img" :src="imgUrl+item.knowIcon" @click="onItemClick(item)" />
                                    <div class="search-list-item__container">
                                        <div class="title" @click="onItemClick(item)">{{ item.knowTitle }}</div>
                                        <div class="description">{{ item.remark }}</div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="search-info">
                        <el-card class="card" shadow="never">
                            <div slot="header" class="header">资源</div>
                            <template v-for="(item, i) in rightNav.group">
                                <div :key="i" class="card-item">
                                    <div>{{ item.type }}</div>
                                    <div>{{ item.count }}</div>
                                </div>
                            </template>
                        </el-card>
                        <el-card class="card" shadow="never">
                            <div slot="header" class="header">上次更新时间</div>
                            <div class="card-item">
                                <div>所有日期</div>
                                <div>{{ rightNav.count }}</div>
                            </div>
                            <div class="card-item">
                                <div>去年</div>
                                <div>{{ rightNav.last }}</div>
                            </div>
                            <div class="card-item">
                                <div>今年</div>
                                <div>{{ rightNav.curr }}</div>
                            </div>
                        </el-card>
                    </div>
                </div>
                <pagination
                    class="pagination"
                    :total="paging.total"
                    :page.sync="paging.pageNum"
                    :limit.sync="paging.pageSize"
                    @pagination="getList"
                />
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
import { know } from "@/api"

export default {
    name: "KnowLibrary",
    components: { Aside, TreeSearch, Main, Wrap, Row },
    data() {
        return {
            imgUrl: process.env.VUE_APP_RESOURCE_SERVER,
            defaultProps: { children: "children", label: "name" },
            form: {
                knowTitle: "",
                knowTypeId: "",
            },
            paging: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
            },
            chooseName: "",
            treeList: [],
            resultList: [],
            treeData: [],
            rightNav: {
                count: 0,
                curr: 0,
                last: 0,
                group: [],
            },
        };
    },
    computed: {
        currentShow() {
            const { pageNum: page, pageSize: size, total } = this.paging;
            const begin = (page - 1) * size + 1;
            return total > 0 ? `${begin}-${begin + this.resultList.length - 1}` : total;
        },
    },
    created() {
        this.getTree();
        this.getList();
    },
    methods: {
        clear() {
            this.form.knowTypeId = "";
            this.chooseName = "";
            this.$refs["treeSearch"].clearChoseStyle();
        },
        reset() {
            this.form = {
                knowTitle: "",
                knowTypeId: "",
            };
            this.chooseName = "";
            this.$refs["treeSearch"].clearChoseStyle();
            this.getList()
        },
        onItemClick(item) {
            this.$router.push({
                name: "KnowInfo",
                query: {
                    code: item.knowCode,
                    name: item.knowTitle
                }
            });
        },
        onNodeClick(data) {
            this.chooseName = data.name;
            this.form.knowTypeId = data.id;
            this.getList();
        },
        async getList() {
            try {
                const {
                    respData: { page, count, curr, last, group },
                } = await know.getList({
                    ...this.paging,
                    ...this.form,
                });
                this.resultList = page.list || [];
                this.paging.total = page.total || 0;
                this.rightNav.count = count || 0;
                this.rightNav.curr = curr || 0;
                this.rightNav.last = last || 0;
                this.rightNav.group = group || [];
            } catch (error) {
                console.log(error);
            }
        },
        async getTree() {
            try {
                const { respData } = await know.getTree();
                this.treeList = respData || [];
                this.treeList.forEach(element => {
                    this.treeData.push(element.id)
                });
            } catch (error) {
                console.log(error);
            }
        },
    },
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
    display: flex;
    .search-info {
        width: 230px;
        min-width: 230px;
        .card {
            margin-top: 15px;
            .header {
                font-size: 14px;
                color: #101010;
            }
            &-item {
                padding: 0 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                margin-bottom: 5px;
                color: #888;
            }
        }
    }
    .search-list-wrapper {
        width: calc(100% - 350px);
        .search-list {
            width: 100%;
            padding: 15px 0;
            &-item {
                width: 100%;
                display: flex;
                margin-bottom: 15px;
                &__img {
                    min-width: 110px;
                    width: 110px;
                    height: 90px;
                    img {
                        width: 100%;
                        height: 100%;
                    }
                }
                &__container {
                    padding-left: 15px;
                    .title {
                        color: #888;
                        font-size: 14px;
                        cursor: pointer;
                        font-weight:bolder;
                        text-align: left;
                        margin:0 !important;
                    }
                    .description {
                        margin-top: 5px;
                        color: #a4a8ac;
                        font-size: 12px;
                        line-height: 1.5em;
                        padding-right: 50px;
                            word-break: break-all;
                        text-overflow: ellipsis;//超出省略
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 3; /* 这里是超出几行省略 */
                        overflow: hidden;
                    }
                }
            }
        }
    }
}
.pagination {
    margin-right: 110px;
    margin-bottom: 25px;
}
</style>
