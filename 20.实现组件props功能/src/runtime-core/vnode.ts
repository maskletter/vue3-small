import { ShapeFlags } from "../shared/ShapeFlags"


export function createVnode(type, props?, children?) {

    const vnode = {
        type, props, children,
        shapeFlag: getShapeFlag(type),
        el: null
    }

    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    return vnode

}


export function getShapeFlag(type) {

    return typeof (type) === 'string' ? ShapeFlags.ELEMENTS : ShapeFlags.STATEFUL_COMPONENT

}