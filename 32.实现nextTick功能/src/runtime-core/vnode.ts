import { ShapeFlags } from "../shared/ShapeFlags"

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');

export function createVnode(type, props?, children?) {

    const vnode = {
        type, props, children,
        shapeFlag: getShapeFlag(type),
        key: props?.key,
        el: null
    }

    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof(children) === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
        }
    } 

    return vnode

}

export function createTextVnode(text) {
    return createVnode(Text, {}, text)
}


export function getShapeFlag(type) {

    return typeof (type) === 'string' ? ShapeFlags.ELEMENTS : ShapeFlags.STATEFUL_COMPONENT

}