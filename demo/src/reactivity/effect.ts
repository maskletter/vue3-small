import { extend } from "../shared";

export class ReactiveEffect {


    constructor(private _fn, public scheduler) { }

    public deps: Array<Set<any>> = [];
    private onStop!: () => void;
    public active = true;
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldEffeft = true;
        activeEffect = this;
        const result = this._fn();
        shouldEffeft = false;
        activeEffect = null as any;
        return result;
    }

    stop() {
        if (!this.active) return
        this.onStop && this.onStop();
        this.active = false;
        this.deps.forEach(dep => {
            dep.clear();
        })
        this.deps.length = 0
    }

}

const effectMaps = new Map();
let activeEffect: ReactiveEffect = null as any
let shouldEffeft = false;

export function ticker(target, key) {

    if (!isTicking()) return

    let targetMap = effectMaps.get(target);

    if (!targetMap) {
        targetMap = new Map();
        effectMaps.set(target, targetMap);
    }

    let deps = targetMap.get(key);
    if (!deps) {
        deps = new Set();
        targetMap.set(key, deps)
    }
    tickerEffect(deps)
}

export function tickerEffect(deps) {
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
}

export function isTicking() {
    return shouldEffeft && activeEffect != null;
}

export function trigger(target, key) {

    const targetMap = effectMaps.get(target);
    const deps = targetMap.get(key);
    triggerEffect(deps);

}

export function triggerEffect(deps) {
    for (const fn of deps) {
        if (fn.scheduler) {
            fn.scheduler();
        } else {
            fn.run();
        }
    }
}


export function effect(fn, options: any = {}) {

    const _effect = new ReactiveEffect(fn, options.scheduler);

    extend(_effect, options)

    _effect.run();

    const _fn: any = _effect.run.bind(_effect);
    _fn._effect = _effect;
    return _fn;

}

export function stop(fn) {
    fn._effect.stop();
}