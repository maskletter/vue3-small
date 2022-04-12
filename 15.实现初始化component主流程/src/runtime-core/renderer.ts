import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, rootContainer) {

    patch(vnode, rootContainer)

}   


export function patch(vnode, container) {
    console.log(vnode)
    processComponent(vnode, container);
}

export function processElement (vnode, container) {
    
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