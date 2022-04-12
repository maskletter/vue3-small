import { isObject } from "../shared";
import { isTracking, trackEffects, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class RefImpl {

    private deps = new Set();
    private _rawValue;
    public __v_isRef = true;
    constructor(private _value) {
        this._value = formatValue(_value);
        this._rawValue = _value;
    }
    
    get value () {
        if (isTracking()) {
            trackEffects(this.deps);
        }
        return this._value;
    }
    set value (value) {
        if (Object.is(this._rawValue, value)) return;
        this._rawValue = value;
        this._value = formatValue(value);
        triggerEffect(this.deps);
    }
}

function formatValue(value) {
    return isObject(value) ? reactive(value) : value
}

export function ref(value) {

    return new RefImpl(value)

}

export function isRef(value) {
    return !!value.__v_isRef;
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}