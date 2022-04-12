import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, rootContainer, parentComponent?) {

    patch(vnode, rootContainer, parentComponent)

}   


export function patch(vnode, container, parentComponent) {

    switch (vnode.type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (vnode.shapeFlag & ShapeFlags.ELEMENTS) {
                processElement(vnode, container, parentComponent)
            } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
    
}

export function processText (vnode, container) {
    const ctx = document.createTextNode(vnode.children);
    container.appendChild(ctx)
}

export function processFragment (vnode, container, parentComponent) {
    mountChildren(vnode.children, container, parentComponent)
}

export function processElement (vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent)
}

export function mountElement (vnode, container, parentComponent) {
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
        mountChildren(children, el, parentComponent);
    } else {
        el.textContent = children;
    }
    container.appendChild(el)
}

function mountChildren(children, container, parentComponent) {
    children.forEach(_vnode => {
        patch(_vnode, container, parentComponent)
    })
}

export function processComponent (vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}

export function mountComponent(vnode, container, parentComponent) {
    const instance = createComponentInstance(vnode, parentComponent);
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

export function setupRenderEffect(instance, container) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container, instance);

    instance.el = subTree.el
}