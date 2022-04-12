import { extend } from "../shared";

class ReactiveEffect {

    constructor(private _fn, public scheduler?) {}

    public deps: Set<any>[] = [];
    private onStop?: () => void;
    private active = true;
    run() {
        activeEffeft = this;
        return this._fn();
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
}

const targetMap = new Map();
let activeEffeft: ReactiveEffect = null as any;
export function track(target, key) {
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
    if (!activeEffeft) return;
    deps.add(activeEffeft);
    activeEffeft.deps.push(deps);
}

export function trigger(target, key, value) {

    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
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