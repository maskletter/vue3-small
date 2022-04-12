import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
    
    private _ditry = true;
    private _value;
    private _effect: ReactiveEffect;
    constructor(private getter) {
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._ditry) {
                this._ditry = true;
            }
        })
    }

    get value() {
        if (this._ditry) {
            this._ditry = false;
            this._value = this._effect.run();
        }
        return this._value;
    }

}

export function computed(getter) {

    return new ComputedRefImpl(getter);

}