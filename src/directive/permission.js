import permission from "../plugins/permission";

export default {
    inserted: function (el, binding) {
        if (!permission(binding.value)) {
            el.parentNode && el.parentNode.removeChild(el)
        }
    }
}
