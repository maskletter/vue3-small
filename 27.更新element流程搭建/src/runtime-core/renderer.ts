import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;

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

    function processText (n1, n2, container) {
        const ctx = document.createTextNode(n2.children);
        container.appendChild(ctx)
    }

    function processFragment (vnode, container, parentComponent) {
        mountChildren(vnode.children, container, parentComponent)
    }

    function processElement (n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n1, n2, container, parentComponent)
        } else {
            console.log('n1', n1)
            console.log('n2', n2)
        }
    }

    function mountElement (n1, n2, container, parentComponent) {
        const { type, props, children } = n2;
        const el = (n2.el = hostCreateElement(type));
        for(const key in props) {
            hostPatchProp(el, key, props[key])
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

    function processComponent (n1, n2, container, parentComponent) {
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
