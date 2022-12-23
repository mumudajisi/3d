<template>
    <div
        v-loading="true"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.7)"
        class="thirdIndex"
    />
</template>

<script>
import { getQueryParam } from "@/utils/tool";
import user from "../api/user";

export default {
    name: "ThirdIndex",
    mounted() {
        this.getToken()
    },
    methods: {
        getToken() {
            const token = getQueryParam("token").token
            if (token) {
                const params = {
                    userToken: token,
                    busiCode: "1001",
                    tranCode: "300000",
                }
                user.thdInSgcc(params).then(res => {
                    if (res.respType === 1) {
                        this.$store.dispatch("userx/login", {
                            username: res.respData.loginId,
                            password: "saDnVJBO2uETGooYgnXuqw=="
                        }).then(res => {
                            this.$router.push("/index")
                        }).catch(err => {
                            window.location.href = process.env.VUE_APP_THIRD_LOGIN;
                            console.log(err)
                        })
                    }
                }).catch(err => {
                    window.location.href = process.env.VUE_APP_THIRD_LOGIN;
                    console.log(err)
                })
            } else {
                window.location.href = process.env.VUE_APP_THIRD_LOGIN;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.thirdIndex {
    width: 100%;
    height: 100%;
}
</style>
