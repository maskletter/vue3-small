import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, rootContainer) {

    patch(vnode, rootContainer)

}   


export function patch(vnode, container) {

    switch (vnode.type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (vnode.shapeFlag & ShapeFlags.ELEMENTS) {
                processElement(vnode, container)
            } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container);
            }
            break;
    }
    
}

export function processText (vnode, container) {
    const ctx = document.createTextNode(vnode.children);
    container.appendChild(ctx)
}

export function processFragment (vnode, container) {
    mountChildren(vnode.children, container)
}

export function processElement (vnode, container) {
    mountElement(vnode, container)
}

export function mountElement (vnode, container) {
    const { type, props, children } = vnode;
    const el = vnode.el = document.createElement(type)
    const isOn = key => /^on[A-Z]/.test(key)
    const event = name => name.slice(2).toLowerCase();
    // debugger
    for(const key in props) {
        if (isOn(key)) {
            el.addEventListener(event(key), props[key])
        } else {
            el.setAttribute(key, props[key])
        }
    }
    if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el);
    } else {
        el.textContent = children;
    }
    container.appendChild(el)
}

function mountChildren(children, container) {
    children.forEach(_vnode => {
        patch(_vnode, container)
    })
}

export function processComponent (vnode, container) {
    mountComponent(vnode, container);
}

export function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

export function setupRenderEffect(instance, container) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);

    instance.el = subTree.el
}