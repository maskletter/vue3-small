import { extend, isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadOnly: boolean = false, shallow = false) {
    return function get(target, key) {

        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadOnly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadOnly;
        }

        const res = Reflect.get(target, key);

        if (shallow) {
            return res;
        }

        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);            
        }

        // 收集依赖
        if (!isReadOnly) {
            track(target, key);
        }
        
        return res;
    }
} 

function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key, value);
        return res;
    }
}

export const mutableHandlers = {
    get, 
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`禁止修改readonly字段: ${key}`)
        return true;
    }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
})