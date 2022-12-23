import Vue from "vue";
import Vuex from "vuex";

import userx from "@/store/modules/user";
import menux from "@/store/modules/menu";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        collapse: false,
        HomeTitle: "",
    },
    getters: {
        collapse: (state) => state.collapse,
    },
    mutations: {
        SET_COLLAPSE(state, collapse) {
            state.collapse = collapse
        },
    },
    actions: {
        toggleCollapse({ commit, state }) {
            commit("SET_COLLAPSE", !state.collapse);
        },
        setCollapse({ commit }, collapse) {
            commit("SET_COLLAPSE", collapse);
        },
    },
    plugins: [createPersistedState({
        key: "TRAIN3D-ADMIN-WEB",
        storage: window.sessionStorage,
    })],
    modules: {
        userx,
        menux,
    },
});

export default store;
