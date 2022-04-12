import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, rootContainer) {

    patch(vnode, rootContainer)

}   


export function patch(vnode, container) {
    if (typeof(vnode.type) === 'string') {
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}

export function processElement (vnode, container) {
    mountElement(vnode, container)
}

export function mountElement (vnode, container) {
    const { type, props, children } = vnode;
    const el = document.createElement(type)
    for(const key in props) {
        el.setAttribute(key, props[key])
    }
    if (Array.isArray(children)) {
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

    const subTree = instance.render();
    patch(subTree, container);

}