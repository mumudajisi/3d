<script>
export default {
    name: "Render",
    props: {
        // eslint-disable-next-line vue/require-default-prop
        h: [Function, Object],
        data: {
            type: Array,
            default: () => [],
        },
    },
    render(h) {
        return typeof this.h === "function" ? this.h(h, ...this.data) : this.h;
    },
};
</script>
