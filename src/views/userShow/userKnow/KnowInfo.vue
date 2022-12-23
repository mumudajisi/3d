<template>
    <Wrap>
        <Row>
            <Main>
                <div class="know-info-container">
                    <div class="article-wrapper">
                        <div class="tootip">{{ detail.knowTitle }}</div>
                        <div class="article" v-html="detail.knowContent" />
                        <span id="anchor-knowLinkTo" style="font-weight:bolder;font-size:18px;margin-left:-7px">【关联词条】:</span>
                        <span v-for="(item, index) in findKnowRes" :key="index" class="bottom">
                            <router-link
                                :key="item.knowCode"
                                class="buttonText"
                                :to="{name:'KnowInfo', query: {code:item.knowCode, name: item.knowTitle}}"
                                style="display: inline-block;margin-left:10px "
                            >
                                {{ item.knowTitle }}
                            </router-link>
                        </span>

                        <div>
                            <span id="anchor-modelLinkTo" style="font-weight:bolder;font-size:18px;margin-left:-7px;line-height:40px">【关联模型】:</span>
                            <span v-for="(item, index) in findModelRes" :key="index" class="bottom" @click="onItemClick(item)">
                                <a class="buttonText" style="display: inline-block;margin-left:10px ">{{ item.modelTitle }}</a>
                            </span>
                        </div>
                    </div>
                </div>
            </Main>
            <Aside>
                <AsideCard header="文章目录">
                    <div class="nav">
                        <div v-for="(item, index) in anchorList" :key="index" class="nav-item">
                            <span v-if="item.tagName==='H3'" style="display: inline-block;width: 15px;" />
                            <i v-if="item.tagName==='H2'" class="icon" />
                            <span v-if="item.tagName==='H3'">* </span>
                            <span @click="goAnchor('#' + item.id)">{{ item.title }}</span>
                        </div>
                    </div>
                </AsideCard>
                <AsideCard header="热点词条">
                    <div class="hot-dict">
                        <div v-for="(item, index) in hot10" :key="index" class="hot-dict-item">
                            <span>{{ index + 1 }}. {{ item.know_title }}</span>
                            <span>{{ item.is_recommend }}</span>
                        </div>
                    </div>
                </AsideCard>
            </Aside>
        </Row>
    </Wrap>
</template>

<script>
import Aside from "@/components/Aside/Aside.vue";
import Wrap from "@/components/Wrap/Wrap.vue";
import Main from "@/components/Main/Main.vue";
import Row from "@/components/Row/Row.vue";
import AsideCard from "@/components/Aside/AsideCard.vue";
import { know } from "@/api";
import { model } from "@/api";

export default {
    name: "KnowInfo",
    components: { Aside, AsideCard, Wrap, Main, Row, },
    data() {
        return {
            hot10: [], // 热点词条
            anchorList: [], // 文章目录
            detail: "", // 详情数据
            findKnowRes: [], // 关联词条
            findModelRes: [], // 关联的模型
        };
    },
    watch: {
        $route: {
            handler() {
                if (this.$route.path !== "/userShow/know/info") return
                this.knowRoute({
                    knowCode: this.$route.query.code,
                    knowTitle: this.$route.query.name
                });
                this.getList();
                setTimeout(() => {
                    this.renderAnchor();
                }, 600);
            },
            deep: true,
        }
    },
    mounted() {
        this.getList();
        setTimeout(() => {
            this.renderAnchor();
        }, 600);
        this.knowRoute({
            knowCode: this.$route.query.code,
            knowTitle: this.$route.query.name
        });
    },
    methods: {
        // 点击词条获取积分
        knowRoute(item) {
            this.detail = ""
            this.anchorList = []
            this.findKnowRes = []
            this.findModelRes = []
            this.$amberBuried({
                postScript: "词条",
                resourceId: item.knowCode,
                scoreMode: 11,
                scoreType: 1,
                remark: item.knowTitle
            })
        },
        renderAnchor() {
            const arr = []
            document.querySelectorAll(`.article > h2, .article > h3`).forEach((item) => {
                item.id = "anchor-" + this.random();
                arr.push({
                    id: item.id,
                    title: item.innerText,
                    tagName: item.tagName
                });
            });
            const arr1 = [
                {
                    id: "anchor-knowLinkTo",
                    title: "关联词条",
                    tagName: "H2"
                },
                {
                    id: "anchor-modelLinkTo",
                    title: "关联模型",
                    tagName: "H2"
                }
            ]
            this.anchorList = arr.concat(arr1)
        },
        random() {
            return parseInt(Math.random() * 1000000000);
        },
        // 跳转到指定的位置
        goAnchor(selector) {
            this.$el.querySelector(selector).scrollIntoView({ block: "start" })
        },
        onItemClick(item) {
            // 点击模型获取积分
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
        getList() {
            const params = {
                busiCode: 1001,
                code: this.$route.query.code,
                tranCode: "361409"
            }
            know.knowDataQueryDetail(params).then(res => {
                if (res.respType === 1) {
                    this.hot10 = res.respData.hotKnow
                    this.detail = res.respData.trainKnowData
                    if (this.detail.solveProblem) this.getKnowData()
                    if (this.detail.linkModelCode) this.getModelData()
                }
            })
        },
        // 获取关联的词条
        getKnowData() {
            const knowParams = {
                busiCode: 1001,
                codes: JSON.parse(this.detail.solveProblem),
                tranCode: "361408"
            }
            know.knowDataQueryCodes(knowParams).then(res => {
                if (res.respType === 1) {
                    this.findKnowRes = res.respData
                }
            })
        },
        // 获取关联的模型
        getModelData() {
            const knowParams = {
                busiCode: 1001,
                codes: JSON.parse(this.detail.linkModelCode),
                tranCode: "361608"
            }
            know.modelTypeQueryCodes(knowParams).then(res => {
                if (res.respType === 1) {
                    this.findModelRes = res.respData
                }
            })
        }
    },
};
</script>
<style>
.article a{
    color: #0000EE ;
    text-decoration: underline;

}
</style>

<style lang="scss" scoped>

.know-info-container {
    padding: 0 20px;
}
.aside-header {
    width: 100%;
    height: 40px;
    line-height: 40px;
}
.place {
    color: #bbb;
    font-size: 14px;
    position: absolute;
    left: -10px;
    top: -22px;
}
.article-wrapper {
    padding: 0 40px 80px 0;
    .tootip {
        margin-top: 10px;
        border-bottom: 1px solid #dcdfe6;
        padding-bottom: 5px;
        color: #888;
    }
    // .article {
    //     margin-top: 18px;
    //     line-height: 34px;
    // }
    .buttonText {
        color: #0000EE ;
        text-decoration: underline;
    }
}
.nav {
    width: 100%;
    min-height: 220px;
    padding: 5px 40px;
    &-item {
        margin-bottom: 5px;
        cursor: pointer;
        .icon {
            color: red;
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid #333;
            margin-right: 10px;
        }
        span {
            font-size: 14px;
            color: #888;
        }
    }
}
.hot-dict {
    width: 100%;
    padding: 5px 30px 5px 40px;
    min-height: 220px;
    &-item {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #101010;
        margin-bottom: 5px;
    }
}
</style>
