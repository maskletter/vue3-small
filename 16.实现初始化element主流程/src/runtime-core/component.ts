import { isObject } from "../shared/index";

export function createComponentInstance(vnode) {

    const component = {
        vnode,
        type: vnode.type
    }

    return component
}

export function setupComponent(instance) {
    // TODO
    // initPorops
    // initSlots
    setupStatefullComponent(instance);
}

export function setupStatefullComponent(instance) {

    const Component = instance.type;
    const { setup } = Component;
    if (setup) {

        const setupResult = setup();
        handlerSetupResult(instance, setupResult)
    }

}

export function handlerSetupResult(instance, setupResult) {
    // TODO function
    if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }

    finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {

    const Component = instance.type;
    // if (Component.render) {
        instance.render = Component.render;
    // }


}