import { ShapeFlags } from "../shared/ShapeFlags";



export function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots)
    }
    
}

function normalizeObjectSlots(children, slots) {

    for(const key in children) {
        const slot = children[key];
        slots[key] = props => normalizeSlotValue(slot(props));
    }

}

function normalizeSlotValue(children) {
    return Array.isArray(children) ? children : [children];
}