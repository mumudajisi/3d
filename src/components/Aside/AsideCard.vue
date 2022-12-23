<template>
    <div class="aside-card">
        <div v-if="header && !$slots.header" class="aside-header">{{ header }}</div>
        <div v-if="$slots.header" class="aside-header">
            <slot name="header">{{ header }}</slot>
        </div>
        <div class="aside-container">
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    name: "AsideCard",
    props: {
        header: {
            type: String,
            default: void 0,
        },
    },
    data() {
        return {};
    },
    methods: {},
};
</script>

<style lang="scss" scoped>
.aside-card {
    width: 100%;
    .aside-header {
        width: 100%;
        height: 40px;
        line-height: 40px;
        padding: 0 10px;
        background-color: #fff;
        color: #101010;
        font-size: 14px;
    }
    .aside-container {
        background-color: #fff;
    }
}
</style>
