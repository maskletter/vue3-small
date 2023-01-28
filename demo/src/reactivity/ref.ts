import { isObject } from '../shared';
import { isTicking, tickerEffect, triggerEffect } from './effect'
import { reactive } from './reactive';

class RefImpl  {

    private deps: Set<any> = new Set();
    private _rawValue!: any;
    private _value!: any
    private __ref = true;
    constructor(_value) {
        this._rawValue = _value;
        this._value = isObject(_value) ? reactive(_value) : _value;
    }

    get value() {
        if (isTicking()) {
            tickerEffect(this.deps);
        }
        return this._value
    }

    set value(newValue) {
        if (this._rawValue == newValue) return
        this._rawValue = newValue;
        this._value = isObject(newValue) ? reactive(newValue) : newValue;;
        triggerEffect(this.deps);
    }

}

export function ref (value) {

    return new RefImpl(value)

}

export function isRef(ref) {
    return ref.__ref || false;
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(rawValue) {

    return new Proxy(rawValue, {
        get(target, key) {
            return unRef(target[key])
        },
        set(target, key, value) {
            if (isRef(target[key])) {
                return (target[key].value = value);
            } else {
                return Reflect.set(target, key, value)
            }
        }
    })

}