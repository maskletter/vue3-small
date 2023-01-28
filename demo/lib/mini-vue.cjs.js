'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = value => {
    return value != null && typeof (value) === 'object';
};

class ReactiveEffect {
    constructor(_fn, scheduler) {
        this._fn = _fn;
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        const result = this._fn();
        return result;
    }
    stop() {
        if (!this.active)
            return;
        this.onStop && this.onStop();
        this.active = false;
        this.deps.forEach(dep => {
            dep.clear();
        });
        this.deps.length = 0;
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    const _fn = _effect.run.bind(_effect);
    _fn._effect = _effect;
    return _fn;
}

function createComponentInstance(vnode) {
    return {
        vnode,
        type: vnode
    };
}
function setupComponent(instance) {
    // console.log(initProps)
    // initProps(instance)
    setupStatefullComponent(instance);
}
function setupStatefullComponent(instance) {
    const Component = instance.type;
    if (Component.setup) {
        instance.setupResult = Component.setup();
    }
    // console.log(instance)
    handlerSetupResult(instance);
}
function handlerSetupResult(instance) {
    // console.log(instance)
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function render(rootComponent, container) {
    patch(null, rootComponent, container);
}
function patch(n1, n2, container) {
    // switch (n2.shapeFlag) {
    //     case value:
    //         break;
    //     default:
    //         break;
    // }
    if (n2.shapeFlag & 1 /* ELEMENTS */) {
        console.log('element', n2);
        processElement(n1, n2, container);
    }
    else {
        processComponent(n1, n2, container);
    }
}
function processElement(n1, n2, container) {
    if (!n1) {
        mountElement(n2, container);
    }
}
function mountElement(element, container) {
    const el = document.createElement(element.type);
    for (const key in element.props) {
        el.setAttribute(key, element.props[key]);
    }
    if (Array.isArray(element.children)) {
        element.children.forEach(element => {
            patch(null, element, container);
        });
    }
    else {
        el.textContent = element.children;
    }
    container.appendChild(el);
}
function processComponent(n1, n2, container) {
    if (!n1) {
        mountComponent(n2, container);
    }
}
function mountComponent(component, container) {
    const instance = createComponentInstance(component);
    setupComponent(instance);
    effect(() => {
        const vnode = instance.render.call(instance.setupResult);
        patch(null, vnode, container);
    });
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            render(rootComponent, rootContainer);
        }
    };
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlags(type)
    };
    return vnode;
}
function getShapeFlags(type) {
    return isObject(type) ? 2 /* STATEFUL_COMPONENT */ : 1 /* ELEMENTS */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
