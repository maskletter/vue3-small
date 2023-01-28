import { ReactiveEffect } from "./effect";

class ComputedImpl {
    private _value!: any
    private _ditry = true;
    private _effect!: any
    constructor(private getter) {
        this._effect = new ReactiveEffect(getter, () => {
            this._ditry = true;
        })
    }

    get value() {
        if (this._ditry) {
            this._value = this._effect.run();
            this._ditry = false;
        }
        return this._value;
    }
}

export function computed(fn) {

    return new ComputedImpl(fn);

}