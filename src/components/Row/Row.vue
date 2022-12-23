<template>
    <div class="row">
        <slot />
    </div>
</template>

<script>
export default {
    name: "Row",
};
</script>

<style lang="scss" scoped>
.row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
    height: 100%;
}
</style>
