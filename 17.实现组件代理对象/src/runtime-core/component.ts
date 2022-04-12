import { isObject } from "../shared/index";
import { componentPlulicInstance } from "./componentPlulicInstance";

export function createComponentInstance(vnode) {

    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
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

    instance.proxy = new Proxy({_: instance}, componentPlulicInstance)

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