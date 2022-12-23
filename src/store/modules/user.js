import { user } from "@/api";

const userx = {
    namespaced: true,
    state: {
        // 用户账号
        id: "",
        // 用户姓名
        name: "",
        // 当前角色
        role: {
            roleId: null,
            roleKey: "",
            roleName: ""
        },
        user: {
            sex: "",
            userId: "",
            userName: "",
        },
        token: "",
        // 用户角色
        roles: [],
        // 用户头像
        custom: false,
        avatar: "",
        tagViews: [{ path: "/index", name: "首页", icon: "index" }],
        permissions: []
    },
    getters: {
        id: (state) => state.user.userId,
        sex: (state) => state.user.sex,
        user: (state) => state.user,
        name: (state) => state.user.userName,
        role: (state) => state.role,
        roles: (state) => state.roles,
        token: (state) => state.token,
        custom: (state) => state.custom,
        avatar: (state) => state.avatar,
        tagViews: (state) => state.tagViews,
    },
    mutations: {
        SET_ROLE: (state, role) => {
            state.role = role
        },
        SET_TOKEN: (state, token) => {
            state.token = token
        },
        SET_CUSTOM: (state, custom) => {
            state.custom = custom
        },
        SET_AVATAR: (state, avatar) => {
            state.avatar = avatar
        },
        SET_USER: (state, user) => {
            state.user = user
        },
        SET_ROLES: (state, roles) => {
            state.roles = roles
        },
        SET_TAGVIEWS: (state, tagviews) => {
            state.tagViews = tagviews
        },
        SET_PERMISSIONS: (state, permissions) => {
            state.permissions = permissions
        },
        LOGIN_OUT(state) {
            state.id = null
            state.name = null
            state.user = null
            state.role = null
            state.roles = null
            state.token = null
            state.avatar = null
            state.custom = false
            state.tagViews = [{ path: "/index", name: "首页", icon: "index" }]
        },
    },
    actions: {
        // 登录
        login({ commit }, userInfo) {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                try {
                    const { respData } = await user.login(userInfo)
                    commit("SET_USER", {
                        sex: respData.sex,
                        userId: respData.userId,
                        userName: respData.userName,
                    })
                    commit("SET_ROLE", respData.roles ? respData.roles[0] : null)
                    commit("SET_TOKEN", respData.token)
                    commit("SET_ROLES", respData.roles)
                    const avatarPath = process.env["VUE_APP_AVATAR_PATH"];
                    new Promise(function (resolve) {
                        const imgurl = respData.userId + "-avatar.png";
                        const image = new Image();
                        image.src = avatarPath + imgurl;
                        image.onload = function () {
                            if (this.complete === true) {
                                commit("SET_CUSTOM", true)
                                commit("SET_AVATAR", avatarPath + imgurl)
                                resolve(true);
                            }
                        }
                        image.onerror = function () {
                            const imgurl = respData.sex === "1" ? "male.png" : "female.png";
                            commit("SET_AVATAR", avatarPath + imgurl)
                            resolve(false);
                        }
                    })
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
        logout({ commit }) {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                try {
                    await user.logout();
                    commit("LOGIN_OUT");
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
    }
}

export default userx;
