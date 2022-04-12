'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const EMPTY_OBJ = {};
const isObject = val => {
    return val != null && typeof (val) === 'object';
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = str => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = str => {
    return str ? `on${capitalize(str)}` : '';
};

let activeEffeft = undefined;
let shouldTrack = false;
class ReactiveEffect {
    constructor(_fn, scheduler) {
        // console.log('?????', _fn, scheduler)
        this._fn = _fn;
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
    }
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
        activeEffeft = undefined;
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
function clearupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.clear();
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let deps = depsMap.get(key);
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }
    trackEffects(deps);
}
function trackEffects(deps) {
    deps.add(activeEffeft);
    activeEffeft.deps.push(deps);
}
function isTracking() {
    return shouldTrack === true && activeEffeft != undefined;
}
function trigger(target, key, value) {
    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    triggerEffect(deps);
}
function triggerEffect(deps) {
    for (let _effect of deps) {
        if (_effect.scheduler) {
            _effect.scheduler();
        }
        else {
            _effect.run();
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner._effect = _effect;
    return runner;
}
function stop(fn) {
    fn._effect.stop();
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        if (key === exports.ReactiveFlags.IS_REACTIVE) {
            return !isReadOnly;
        }
        else if (key === exports.ReactiveFlags.IS_READONLY) {
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
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`禁止修改readonly字段: ${key}`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

exports.ReactiveFlags = void 0;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(exports.ReactiveFlags || (exports.ReactiveFlags = {}));
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function isReactive(raw) {
    return !!raw[exports.ReactiveFlags.IS_REACTIVE];
}
function isReadonly(raw) {
    return !!raw[exports.ReactiveFlags.IS_READONLY];
}
function isProxy(raw) {
    return isReadonly(raw) || isReactive(raw);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`${raw} target不是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

class RefImpl {
    constructor(_value) {
        this._value = _value;
        this.deps = new Set();
        this.__v_isRef = true;
        this._value = formatValue(_value);
        this._rawValue = _value;
    }
    get value() {
        if (isTracking()) {
            trackEffects(this.deps);
        }
        return this._value;
    }
    set value(value) {
        if (Object.is(this._rawValue, value))
            return;
        this._rawValue = value;
        this._value = formatValue(value);
        triggerEffect(this.deps);
    }
}
function formatValue(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(value) {
    return !!value.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(valueWithRefs) {
    return new Proxy(valueWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, event, ...argv) {
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...argv);
}

const publicPropertiesMap = {
    $el: i => i.el,
    $slots: i => i.slots,
    $props: i => i.props
};
const componentPlulicInstance = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const slot = children[key];
        slots[key] = props => normalizeSlotValue(slot(props));
    }
}
function normalizeSlotValue(children) {
    return Array.isArray(children) ? children : [children];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        next: null,
        component: null,
        emit: () => null,
        provides: (parent === null || parent === void 0 ? void 0 : parent.provides) || {},
        parent,
        isMounted: false,
        subTree: null,
        slots: {}
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    // initPorops
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // initSlots
    setupStatefullComponent(instance);
}
function setupStatefullComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, componentPlulicInstance);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handlerSetupResult(instance, setupResult);
    }
}
function handlerSetupResult(instance, setupResult) {
    // TODO function
    if (isObject(setupResult)) {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // console.log(Component)
    // if (Component.render) {
    instance.render = Component.render;
    // }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nexrProps } = nextVNode;
    for (const key in nexrProps) {
        if (nexrProps[key] != prevProps[key]) {
            return true;
        }
    }
    return false;
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVnode(type, props, children) {
    const vnode = {
        type, props, children,
        shapeFlag: getShapeFlag(type),
        key: props === null || props === void 0 ? void 0 : props.key,
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof (children) === 'object') {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof (type) === 'string' ? 1 /* ELEMENTS */ : 2 /* STATEFUL_COMPONENT */;
}

function createAppApi(renderer) {
    return function render(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVnode(rootComponent);
                renderer(vnode, rootContainer);
            }
        };
    };
}
// export function createApp(rootComponent) {
//     return {
//         mount(rootContainer) {
//             const vnode = createVnode(rootComponent);
//             render(vnode, rootContainer);
//         }
//     }
// }

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(n2, rootContainer, parentComponent, anchor) {
        patch(null, n2, rootContainer, parentComponent, anchor);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        switch (n2.type) {
            case Fragment:
                processFragment(n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (n2.shapeFlag & 1 /* ELEMENTS */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (n2.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        if (!n1) {
            const ctx = (n2.el = document.createTextNode(n2.children));
            container.appendChild(ctx);
        }
        else {
            n2.el = n1.el;
            n2.el.nodeValue = n2.children;
            console.log(222);
        }
    }
    function processFragment(vnode, container, parentComponent, anchor) {
        mountChildren(vnode.children, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n1, n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (nextShapeFlag & 4 /* TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                unmountChildren(n1.children);
            }
            if (c1 != c2) {
                hostSetElementText(container, n2.children);
            }
        }
        else if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
            if (nextShapeFlag & 8 /* ARRAY_CHILDREN */) {
                hostSetElementText(container, '');
                mountChildren(n2.children, container, parentComponent, anchor);
            }
        }
        else if (prevShapeFlag & 8 /* ARRAY_CHILDREN */ && nextShapeFlag & 8 /* ARRAY_CHILDREN */) {
            patchKeyedChildren(c1, c2, container, parentComponent, anchor);
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        // 两端对齐算法
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        const isSomeNodeType = (n1, n2) => {
            return n1.type == n2.type && n1.key == n2.key;
        };
        // 从左开始对比
        while (i <= e2 && i <= e1) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 从右开始对比
        while (i <= e2 && i <= e1) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < c2.length ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 旧的比新的多时候的情况
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间情况
            const s1 = i;
            const s2 = i;
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            let keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched);
            let maxNewIndexSofar = 0;
            let moved = false;
            for (let index = 0; index < toBePatched; index++) {
                newIndexToOldIndexMap[index] = 0;
            }
            for (let i = s2; i <= e2; i++) {
                const nextChildren = c2[i];
                keyToNewIndexMap.set(nextChildren.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                const prevChldren = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChldren.el);
                }
                let newIndex;
                if (prevChldren.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChldren.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        const nextChildren = c2[j];
                        if (isSomeNodeType(prevChldren, nextChildren)) {
                            newIndex = i;
                            break;
                        }
                    }
                }
                if (newIndex == undefined) {
                    hostRemove(prevChldren.el);
                }
                else {
                    if (newIndex >= maxNewIndexSofar) {
                        maxNewIndexSofar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChldren, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChildren = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] == 0) {
                    patch(null, nextChildren, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || j != increasingNewIndexSequence[i]) {
                        // 移动
                        hostInsert(nextChildren.el, container, parentComponent, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        for (let index = 0; index < children.length; index++) {
            const element = children[index].el;
            hostRemove(element);
        }
    }
    function patchProps(container, oldProps, newProps) {
        if (oldProps != newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (nextProp != prevProp) {
                    hostPatchProp(container, key, prevProp, nextProp);
                }
            }
        }
        if (oldProps != EMPTY_OBJ) {
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(container, key, oldProps[key], null);
                }
            }
        }
    }
    function mountElement(n1, n2, container, parentComponent, anchor) {
        const { type, props, children } = n2;
        const el = (n2.el = hostCreateElement(type));
        for (const key in props) {
            hostPatchProp(el, key, null, props[key]);
        }
        if (n2.shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(children, el, parentComponent, anchor);
        }
        else {
            el.textContent = children;
        }
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(_vnode => {
            patch(null, _vnode, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            n2.vnode = n2;
        }
    }
    function mountComponent(vnode, container, parentComponent, anchor) {
        const instance = (vnode.component = createComponentInstance(vnode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, container, anchor);
    }
    function setupRenderEffect(instance, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                patch(null, subTree, container, instance, anchor);
                instance.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const nextTree = instance.render.call(instance.proxy);
                const prevTree = instance.subTree;
                instance.subTree = nextTree;
                patch(prevTree, nextTree, prevTree.el, instance, anchor);
            }
        });
    }
    function updateComponentPreRender(instance, nextVNode) {
        instance.vnode = nextVNode;
        instance.next = null;
        instance.props = nextVNode.props;
    }
    return {
        createApp: createAppApi(render)
    };
}
// 最长递增子序列
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, name, props) {
    // return createVnode('div', {}, slots)
    const slot = slots[name];
    if (slot) {
        if (typeof (slot) === 'function') {
            return createVnode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (parentProvides == currentInstance.provides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        return currentInstance.parent.provides[key];
    }
}

const isOn = key => /^on[A-Z]/.test(key);
const event = name => name.slice(2).toLowerCase();
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevProp, nextProp) {
    if (isOn(key)) {
        el.addEventListener(event(key), nextProp);
    }
    else {
        if (nextProp === undefined || nextProp === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextProp);
        }
    }
}
function insert(el, parent, anchor = null) {
    // parent.appendChild(el);
    parent.insertBefore(el, anchor);
}
function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement, patchProp, insert, remove, setElementText
});
function createApp(...argv) {
    return renderer.createApp(...argv);
}

exports.ReactiveEffect = ReactiveEffect;
exports.createApp = createApp;
exports.createElement = createElement;
exports.createRenderer = createRenderer;
exports.createTextVnode = createTextVnode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.insert = insert;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.isTracking = isTracking;
exports.patchProp = patchProp;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.remove = remove;
exports.renderSlots = renderSlots;
exports.setElementText = setElementText;
exports.shallowReadonly = shallowReadonly;
exports.stop = stop;
exports.track = track;
exports.trackEffects = trackEffects;
exports.trigger = trigger;
exports.triggerEffect = triggerEffect;
exports.unRef = unRef;
