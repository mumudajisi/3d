<script>
const iconPrefixReg = /^[a-z]{1,}-icon-/;

export default {
    name: "Icon",
    props: {
        icon: {
            type: String,
            default: "",
        },
    },
    data() {
        return {};
    },
    methods: {},
    render(h) {
        return iconPrefixReg.test(this.icon)
            ? h("i", { class: this.icon })
            : h("svg-icon", {
                props: {
                    iconClass: this.icon,
                },
            });
    },
};
</script>

<style lang="scss" scoped></style>
