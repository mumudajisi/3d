/**
 * 查找对应的值
 * @param value 需要查找的字符串
 * @param list 需要查找的数据
 * @param key 查找的key值
 * @param text 需要返回的对应字段的值
 * @returns {*|string}
 */
import store from "@/store"

export function getFindValue(value, list, key, text = null) {
    if (value) {
        const found = list.find((item) => {
            return item[key] === value
        })
        return text ? (found ? found[text] : "") : found
    }
    return value
}

/**
 * 获取按钮权限并且返回名称
 * @param code 权限字符
 * @returns {boolean|*}
 */
export function getRoleBtn(code) {
    if (!code) {
        return true
    }
    return store.getters["menux/buttonList"].find((item) => item.perms === code)?.menuName
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
    const config = {
        id: id || "id",
        parentId: parentId || "parentId",
        childrenList: children || "children"
    }

    const childrenListMap = {}
    const nodeIds = {}
    const tree = []

    for (const d of data) {
        const parentId = d[config.parentId]
        if (childrenListMap[parentId] == null) {
            childrenListMap[parentId] = []
        }
        nodeIds[d[config.id]] = d
        childrenListMap[parentId].push(d)
    }

    for (const d of data) {
        const parentId = d[config.parentId]
        if (nodeIds[parentId] == null) {
            tree.push(d)
        }
    }

    for (const t of tree) {
        adaptToChildrenList(t)
    }

    function adaptToChildrenList(o) {
        if (childrenListMap[o[config.id]] !== null) {
            o[config.childrenList] = childrenListMap[o[config.id]]
        }
        if (o[config.childrenList]) {
            for (const c of o[config.childrenList]) {
                adaptToChildrenList(c)
            }
        }
    }

    return tree
}

/**
 * 数组对象去重
 * @param arr 需要去重的对象
 * @param batch 根据这个属性去重
 * @returns {*[]|*}
 */
export function removedup(arr, batch) {
    if (!Array.isArray(arr)) {
        return arr;
    }
    if (arr.length === 0) {
        return [];
    }
    const obj = {};
    return arr.reduce((total, item) => {
        obj[item[batch]] ? "" : (obj[item[batch]] = true && total.push(item));
        return total;
    }, []);
}

/**
 * 获取浏览器地址栏中的参数
 * @param {String} key 返回对应字段名的参数值；不传则返回所有参数值
 * @returns {{[p: string]: *}} 以对象返回所有参数值
 */
export function getQueryParam(key) {
    const search = window.location.search.replace(/^\?/, "");
    const pairs = search.split("&");
    return pairs.map(pair => {
        const [key, value] = pair.split("=");
        return [decodeURIComponent(key), decodeURIComponent(value)];
    }).reduce((res, [key, value]) => Object.assign(res, { [key]: value }), {})
}
