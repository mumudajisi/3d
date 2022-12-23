import Store from "@/store";

export default function permission(role) {
    const roles = Array.isArray(role) ? role : typeof role === "string" ? role.split(",") : [];
    return Store.getters["menux/buttonList"].map(item => item.perms).some(item => roles.includes(item))
}
