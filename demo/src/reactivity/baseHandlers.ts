import { extend, isObject } from "../shared";
import { ticker, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from './reactive'

const get = createGetter();
const set = createSetter();
const getReadOnly = createGetter(true);
const getShallowReadonly = createGetter(true, true);


export function createGetter(isReadOnly = false, isShallow = false) {

    return function get(target, key) {

        if (key == ReactiveFlags.IS_READONLY) {
            return isReadOnly;
        } else if (key == ReactiveFlags.IS_REACTIVE) {
            return !isReadOnly;
        }
        let res = Reflect.get(target, key);

        if (isShallow) {
            return res;
        }

        const type = isObject(res);
        if (!isReadOnly) {
            ticker(target, key)
        }

        return type ? (isReadOnly ? readonly(res) : reactive(res)) : res;
    }

}

export function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);

        trigger(target, key);

        return res;
    }
}


export const reactiveHandlers = {
    get, set
};
export const readonlyHandlers = {
    get: getReadOnly,
    set() {
        console.warn('readonly属性')
        return true
    }
};
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: getShallowReadonly
})