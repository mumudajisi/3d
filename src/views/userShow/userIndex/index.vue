<template>
    <!-- <Wrap>
        <BreadCrumbs>模拟运行 > 首页</BreadCrumbs>
        <Row>
            <Aside />
            <Main />
        </Row>
    </Wrap> -->
    <iframe id="iframe" src="map/echarts.html" width="100%" height="100%" frameborder="0" />

</template>
<script>
export default {
    name: "Index",
};
</script>

<style lang="scss" scoped>
.index {
    width: 100%;
    height: 100%;
    overflow-y: auto;
}
</style>
