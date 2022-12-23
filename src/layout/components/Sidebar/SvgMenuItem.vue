<script>
import Icon from "@/components/Icon/Icon.vue";

export default {
    name: "SvgMenuItem",
    functional: true,
    components: {
        Icon,
    },
    props: {
        icon: {
            type: String,
            default: "",
        },
        title: {
            type: String,
            default: "",
        },
    },
    render(h, context) {
        const { icon, title } = context.props;
        const vnodes = [];
        if (icon) {
            vnodes.push(<Icon icon={icon} />);
        }
        if (title) {
            if (title.length > 5) {
                vnodes.push(
                    <span slot="title" title={title}>
                        {title}
                    </span>
                );
            } else {
                vnodes.push(<span slot="title">{title}</span>);
            }
        }
        return vnodes;
    },
};
</script>
