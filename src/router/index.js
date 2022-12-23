import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";
import LayoutView from "@/layout/LayoutView.vue";

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
    {
        path: "/redirect",
        name: "Redirect",
        component: Layout,
        children: [
            {
                path: "/redirect/:path(.*)",
                component: () => import("@/views/redirect"),
            },
        ],
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/login"),
    },
    {
        path: "/thirdIndex",
        name: "thirdIndex",
        component: () => import("@/views/thirdIndex"),
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("@/views/register"),
    },
    {
        path: "/404",
        name: "404",
        component: () => import("@/views/error/404"),
    },
    {
        path: "/401",
        name: "401",
        component: () => import("@/views/error/401"),
    },

    {
        path: "/",
        component: Layout,
        redirect: "index",
        children: [
            {
                path: "index",
                component: () => import("@/views/index/indexEcharts"),
                name: "Index",
                meta: { title: "首页", icon: "index" },
            },
        ],
    },
];

export const dynamicRoutes = [
    {
        path: "/user",
        component: Layout,
        name: "User",
        meta: {
            title: "用户中心",
            icon: "",
        },
        children: [
            {
                path: "user",
                component: () => import("@/views/user/user"),
                name: "UserManage",
                meta: { title: "用户管理", icon: "", permission: ["user"] },
            },
            {
                path: "role",
                component: () => import("@/views/user/role"),
                name: "RoleManage",
                meta: { title: "角色管理", icon: "", permission: ["role"] },
            },
            {
                path: "person",
                component: () => import("@/views/user/person"),
                name: "PersonCenter",
                meta: { title: "个人中心", icon: "" },
            },
            {
                path: "dept",
                component: () => import("@/views/user/dept"),
                name: "DeptManage",
                meta: { title: "部门管理", icon: "", permission: ["dept"] },
            },
            {
                path: "post",
                component: () => import("@/views/user/post"),
                name: "PostManage",
                meta: { title: "岗位管理", icon: "", permission: ["post"] },
            }
        ],
    },
    {
        path: "/simu",
        component: Layout,
        name: "Simu",
        meta: {
            title: "模拟仿真",
            icon: "",
        },
        children: [
            {
                path: "line",
                component: () => import("@/views/simu/line"),
                name: "LineManage",
                meta: { title: "线路管理", icon: "", permission: ["line"] },
            },
            {
                path: "node",
                component: () => import("@/views/simu/node"),
                name: "NodeManage",
                meta: { title: "节点管理", icon: "", permission: ["node"] },
            },
        ],
    },
    {
        path: "/model",
        component: Layout,
        name: "Model",
        meta: {
            title: "模型库管理",
            icon: "",
        },
        children: [
            {
                path: "type",
                component: () => import("@/views/model/type"),
                name: "ModelTypeManage",
                meta: { title: "模型类别管理", icon: "", permission: ["train3d:type:list"] },
            },
            {
                path: "data",
                component: () => import("@/views/model/data"),
                name: "ModelDataManage",
                meta: { title: "模型管理", icon: "", permission: ["train3d:list"] },
            },
        ],
    },
    {
        path: "/know",
        component: Layout,
        name: "Know",
        meta: {
            title: "知识库",
            icon: "",
        },
        children: [
            {
                path: "type",
                component: () => import("@/views/know/type"),
                name: "KnowTypeManage",
                meta: { title: "词条类别管理", icon: "", permission: ["know:type:list"] },
            },
            {
                path: "data",
                component: () => import("@/views/know"),
                name: "KnowDataManage",
                meta: { title: "词条管理", icon: "", permission: ["know:list"] },
            },
        ],
    },
    {
        path: "/userShow",
        component: Layout,
        name: "userShow",
        meta: {
            title: "用户展示",
            icon: "",
        },
        children: [
            {
                path: "userIndex",
                name: "user-index",
                component: () => import("@/views/userShow/userIndex/echart.vue"),
                meta: { title: "模拟运行", icon: "" },
            },
            {
                path: "userModel",
                name: "user-model",
                component: () => import("@/views/userShow/userModel"),
                meta: { title: "模型库", icon: "" },
            },
            {
                path: "userKnow",
                name: "user-know",
                component: () => import("@/views/userShow/userKnow/index"),
                meta: { title: "知识库", icon: "" },
            },
            {

                name: "KnowInfo",
                path: "know/info",
                props: true,
                component: () => import("@/views/userShow/userKnow/KnowInfo"),
                meta: { title: "详细信息" }
            },
        ]
    },
    {
        path: "/allExams",
        component: Layout,
        // name: "allExams",
        meta: { title: "所有考试", icon: "" },
        // redirect: "allExams",
        children: [
            {
                path: "",
                name: " AllExamsIndex",
                component: () => import("@/views/allExams"),
                meta: { title: "所有考试", icon: "" },
            }
        ]
    },
    {
        path: "/student",
        component: Layout,
        name: "student",
        meta: { title: "我的", icon: "" },
        children: [
            {
                path: "myTrain",
                name: "myTrain",
                component: () => import("@/views/train/myTrain.vue"),
                meta: { title: "我的培训", icon: "" },
            },
            {
                path: "examList",
                // name: " AppendExamIndex",
                component: () => import("@/views/student/examList"),
                meta: { title: "我的考试", icon: "" },
                children: [
                    {
                        path: "appendExam",
                        name: " AppendExamIndex",
                        component: () => import("@/views/student/appendExam"),
                        meta: { title: "考试", icon: "" },
                    },
                    {
                        path: "result",
                        name: " ResultIndex",
                        component: () => import("@/views/student/result"),
                        meta: { title: "答案", icon: "" },
                    },
                ]
            },
            {
                path: "integral",
                name: " IntegralIndex",
                component: () => import("@/views/student/examList/integral"),
                meta: { title: "我的学分", icon: "" },
            }
        ]
    },
    {
        path: "/train",
        // name: "Train",
        component: Layout,
        meta: { title: "培训管理", icon: "" },
        children: [
            {
                path: "",
                // name: " AllExamsIndex",
                component: () => import("@/views/train"),
                meta: { title: "培训管理", icon: "" },
            },
            {
                path: "/trainDetail",
                name: " trainDetail",
                component: () => import("@/views/train/trainDetail"),
                meta: { title: "培训详情", icon: "" },
            }
        ]
    },
    {
        path: "/allTrain",
        // name: "allTrain",
        component: Layout,
        meta: { title: "所有培训", icon: "" },
        children: [
            {
                path: "",
                // name: " AllExamsIndex",
                component: () => import("@/views/train/allTrain.vue"),
                meta: { title: "所有培训", icon: "" },
            }
        ]
    },
    // {
    //     path: "myTrain",
    //     name: "myTrain",
    //     component: () => import("@/views/train/myTrain.vue"),
    //     meta: { title: "我的培训", icon: "" },
    // },
    // {
    //     path: "allTrain",
    //     name: "allTrain",
    //     component: () => import("@/views/train/myTrain.vue"),
    //     meta: { title: "我的培训", icon: "" },
    // }
    {
        path: "/exam",
        name: "Exam",
        component: Layout,
        meta: { title: "考试管理", icon: "" },
        children: [
            {
                path: "bank",
                name: "BankIndex",
                component: () => import("@/views/exam/bank"),
                meta: { title: "题库管理", icon: "" },
            },
            {
                path: "paper",
                name: "PaperIndex",
                component: () => import("@/views/exam/paper"),
                meta: { title: "试卷管理", icon: "" },
            },
            {
                path: "correcting",
                name: "CorrectIndex",
                component: () => import("@/views/exam/correcting"),
                meta: { title: "批改试卷", icon: "" },
            },
            {
                path: "topic",
                name: "TopicIndex",
                component: () => import("@/views/exam/topic"),
                meta: { title: "试题管理", icon: "" },
            },
            {
                path: "exam",
                name: "ExamIndex",
                component: () => import("@/views/exam/exam"),
                meta: { title: "考试管理", icon: "" },
            },
            {
                path: "examine",
                name: "ExamineIndex",
                component: () => import("@/views/exam/examine"),
                meta: { title: "考生", icon: "" },
            }
        ]
    },
    {
        path: "/system",
        component: Layout,
        name: "System",
        meta: {
            title: "系统管理",
            icon: "",
        },
        children: [
            {
                name: "Menu",
                path: "menu",
                component: () => import("@/views/system/menu"),
                meta: { title: "菜单管理", icon: "" },
            },
            {
                path: "dict-data",
                component: () => import("@/views/system/dict/data"),
                name: "DictData",
                meta: { title: "字典管理", icon: "" },
            },
            {
                path: "dict-data/:dictCode",
                component: () => import("@/views/system/dict/type"),
                name: "DictType",
                meta: { title: "字典数据", icon: "", activeMenu: "/system/dict-type" },
            },
            {
                path: "param",
                component: () => import("@/views/system/param"),
                name: "Param",
                meta: { title: "参数管理", icon: "" },
            },
            {
                path: "service",
                component: () => import("@/views/system/service"),
                name: "Service",
                meta: { title: "系统服务", icon: "" },
            },
            {
                path: "notice",
                component: () => import("@/views/system/notice"),
                name: "Notice",
                meta: { title: "公告管理", icon: "" },
            },
            {
                path: "log",
                component: LayoutView,
                name: "Log",
                meta: { title: "日志管理", icon: "" },
                children: [
                    {
                        path: "login",
                        component: () => import("@/views/system/log/login"),
                        name: "LoginLog",
                        meta: { title: "登录日志", icon: "" },
                    },
                    {
                        path: "oper",
                        component: () => import("@/views/system/log/oper"),
                        name: "OperateLog",
                        meta: { title: "操作日志", icon: "" },
                    },
                ],
            },
        ],
    },
];

const notFound = [{ path: "*", redirect: "/401" }];

// 防止连续点击多次路由报错
const routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
    return routerPush.call(this, location).catch((err) => err);
};
export default new Router({
    mode: "history", // 去掉url中的#
    scrollBehavior: () => ({ y: 0 }),
    routes: [...constantRoutes, ...dynamicRoutes, ...notFound],
});
