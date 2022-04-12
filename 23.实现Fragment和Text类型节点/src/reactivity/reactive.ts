import { isObject } from "../shared/index";
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
    return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(raw) {
    return !!raw[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(raw) {
    return !!raw[ReactiveFlags.IS_READONLY]
}

export function isProxy(raw) {
    return isReadonly(raw) || isReactive(raw)
}

function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`${raw} target不是一个对象`)
        return raw
    }
    return new Proxy(raw, baseHandlers)
}