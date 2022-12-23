import router from "@/router";
import store from "@/store";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

const whiteList = ["/login", "/auth-redirect", "/bind", "/register", "/thirdIndex"];

router.beforeEach((to, from, next) => {
    NProgress.start();
    if (to.meta.title) {
        document.title = to.meta.title + "-" + process.env.VUE_APP_TITLE
    }
    const token = store.getters["userx/token"]
    if (token) {
        next();
        NProgress.done();
    } else {
        // 没有token
        if (whiteList.indexOf(to.path) !== -1) {
            // 在免登录白名单，直接进入
            next();
            NProgress.done();
        } else {
            next(`/thirdIndex?redirect=${to.fullPath}`); // 否则全部重定向到第三方登录页
            // next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
            NProgress.done();
        }
    }
});

router.afterEach(() => {
    NProgress.done();
});
