import { menu } from "@/api";
import { splitMenuBtn } from "@/utils";

const menux = {
    namespaced: true,
    state: {
        menusList: [],
        buttonList: [],
    },
    getters: {
        menusList: (state) => state.menusList,
        buttonList: (state) => state.buttonList,
    },
    mutations: {
        SET_MENULIST: (state, menuslist) => {
            state.menusList = menuslist
        },
        SET_BUTTONLIST: (state, buttonlist) => {
            state.buttonList = buttonlist
        }
    },
    actions: {
        async getMenuTree({ commit }) {
            try {
                const { respData } = await menu.getMenuTree();
                const { buttons, menus } = splitMenuBtn(Array.isArray(respData) ? respData : []);
                if (menus.length < 5) {
                    this.dispatch("setCollapse", true)
                } else {
                    this.dispatch("setCollapse", false)
                }
                commit("SET_MENULIST", menus);
                commit("SET_BUTTONLIST", buttons);
            } catch (error) {
                console.log(error);
            }
        },
    },
}
export default menux;
