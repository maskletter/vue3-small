import { initProps } from "./componentProps";


export function createComponentInstance(vnode) {

    return {
        vnode,
        type: vnode
    }
}

export function setupComponent(instance) {

// console.log(initProps)
    // initProps(instance)
    setupStatefullComponent(instance);

}

export function setupStatefullComponent(instance) {

    const Component = instance.type;

    if (Component.setup) {

        instance.setupResult = Component.setup();
    }
    // console.log(instance)

    handlerSetupResult(instance)
}

export function handlerSetupResult(instance) {
    // console.log(instance)
    finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {

    const Component = instance.type;
    instance.render = Component.render;

}