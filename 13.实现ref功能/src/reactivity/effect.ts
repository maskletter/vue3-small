import { extend } from "../shared";

let activeEffeft: ReactiveEffect = undefined as any;
let shouldTrack = false;
class ReactiveEffect {

    constructor(private _fn, public scheduler?) {}

    public deps: Set<any>[] = [];
    private onStop?: () => void;
    private active = true;
    run() {
        if (!this.active) {
            return this._fn();
        }
        // 打开收集依赖开关
        shouldTrack = true;
        activeEffeft = this;
        const result = this._fn();
        // 关闭开关
        shouldTrack = false;
        activeEffeft = undefined as any;
        return result;
    }

    stop() {
        if (this.active) {
            this.active = false;
            if (this.onStop) {
                this.onStop();
            }
            clearupEffect(this);
        }
    }
}

function clearupEffect(effect: ReactiveEffect) {
    effect.deps.forEach(dep => {
        dep.clear();
    })
    effect.deps.length = 0;
}

const targetMap = new Map();
export function track(target, key) {

    if (!isTracking()) return;

    let depsMap: Map<any, any> = targetMap.get(target);

    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let deps: Set<any> = depsMap.get(key);
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps)
    }
    trackEffects(deps);
}

export function trackEffects(deps) {
    deps.add(activeEffeft);
    activeEffeft.deps.push(deps);
}

export function isTracking() {
    return shouldTrack === true && activeEffeft != undefined
}

export function trigger(target, key, value) {

    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    triggerEffect(deps);
}

export function triggerEffect(deps) {
    for(let _effect of deps) {
        if (_effect.scheduler) {
            _effect.scheduler();
        } else {
            _effect.run();
        }
    }
}

export function effect(fn, options: any = {}) {

    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);

    _effect.run();

    const runner: any = _effect.run.bind(_effect);;
    runner._effect = _effect;
    return runner;
    
}

export function stop(fn) {
    fn._effect.stop();
}