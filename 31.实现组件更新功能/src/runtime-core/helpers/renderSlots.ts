import { createVnode, Fragment } from "../vnode";


export function renderSlots(slots, name, props) {
    // return createVnode('div', {}, slots)
    const slot = slots[name];
    if (slot) {
        if (typeof(slot) === 'function') {
            return createVnode(Fragment, {}, slot(props))
        }
    }
}