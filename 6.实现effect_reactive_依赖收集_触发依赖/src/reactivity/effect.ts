
class ReactiveEffect {

    constructor(private _fn) {}

    run() {
        activeEffeft = this;
        this._fn();
    }
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
    deps.add(activeEffeft);

}

export function trigger(target, key, value) {

    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    for(let _effet of deps) {
        _effet.run();
    }

}

export function effect(fn) {

    const _effet = new ReactiveEffect(fn);


    _effet.run();
    
}