import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {

    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText 
    } = options;

    function render(n2, rootContainer, parentComponent?) {

        patch(null, n2, rootContainer, parentComponent)

    }


    function patch(n1, n2, container, parentComponent) {

        switch (n2.type) {
            case Fragment:
                processFragment(n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (n2.shapeFlag & ShapeFlags.ELEMENTS) {
                    processElement(n1, n2, container, parentComponent)
                } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }

    }

    function processText(n1, n2, container) {
        const ctx = document.createTextNode(n2.children);
        container.appendChild(ctx)
    }

    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode.children, container, parentComponent)
    }

    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n1, n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container, parentComponent)
        }
    }

    function patchElement(n1, n2, container, parentComponent) {

        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;

        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent);
        patchProps(el, oldProps, newProps);
    }

    function patchChildren(n1, n2, container, parentComponent) {

        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;

        if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(n1.children);
            }
            if (c1 != c2) {
                hostSetElementText(container, n2.children);
            }
        } else if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            hostSetElementText(container, '');
            mountChildren(n2. children, container, parentComponent);
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
                    hostPatchProp(container, key, prevProp, nextProp)
                }
            }
        }
        if (oldProps != EMPTY_OBJ) {
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(container, key, oldProps[key], null)
                }
            }
        }

    }

    function mountElement(n1, n2, container, parentComponent) {
        const { type, props, children } = n2;
        const el = (n2.el = hostCreateElement(type));
        for (const key in props) {
            hostPatchProp(el, key, null, props[key])
        }
        if (n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parentComponent);
        } else {
            el.textContent = children;
        }
        hostInsert(el, container)
    }

    function mountChildren(children, container, parentComponent) {
        children.forEach(_vnode => {
            patch(null, _vnode, container, parentComponent)
        })
    }

    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }

    function mountComponent(vnode, container, parentComponent) {
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance)
        setupRenderEffect(instance, container)
    }

    function setupRenderEffect(instance, container) {
        effect(() => {
            if (!instance.isMounted) {
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                patch(null, subTree, container, instance);
                instance.el = subTree.el
                instance.isMounted = true;
            } else {
                const subTree = instance.render.call(instance.proxy);
                const prev = instance.subTree;
                instance.subTree = subTree;
                patch(prev, subTree, container, instance);
            }
        })
    }

    return {
        createApp: createAppApi(render)
    }
}
