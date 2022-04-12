

export function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nexrProps } = nextVNode;

    for (const key in nexrProps) {
        if (nexrProps[key] != prevProps[key]) {
            return true;
        }
    }
    return false

}