import { isObject } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type, props, children?) {

    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlags(type)
    };
    return vnode 
}

function getShapeFlags(type) {

    return isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : ShapeFlags.ELEMENTS

}