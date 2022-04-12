import { shallowReadonly } from "../reactivity/reactive";
import { isObject } from "../shared/index";
import { emit } from "./componentEmit";
import { componentPlulicInstance } from "./componentPlulicInstance";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode) {

    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        emit: () => null,
        slots: {}
    }

    component.emit = emit.bind(null, component) as any;
    return component
}

export function setupComponent(instance) {
    // TODO
    // initPorops
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children)
    // initSlots
    setupStatefullComponent(instance);
}

export function setupStatefullComponent(instance) {

    const Component = instance.type;

    instance.proxy = new Proxy({_: instance}, componentPlulicInstance)

    const { setup } = Component;
    if (setup) {
        const setupResult = setup( shallowReadonly(instance.props), {
            emit: instance.emit
        });
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
    // console.log(Component)
    // if (Component.render) {
        instance.render = Component.render;
    // }


}