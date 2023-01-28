import { reactiveHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";


export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}


export function reactive(raw) {

    return createActiveObject(raw, reactiveHandlers)

}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}

export function isReadonly(value) {
    return value[ReactiveFlags.IS_READONLY] || false
}
export function isReactive(value) {
    return value[ReactiveFlags.IS_REACTIVE] || false
}

export function isProxy(value) {
    return isReadonly(value) || isReactive(value)
}

function createActiveObject(raw, handlers) {
    return new Proxy(raw, handlers);
}