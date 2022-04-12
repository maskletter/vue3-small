import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;

    function render(vnode, rootContainer, parentComponent?) {

        patch(vnode, rootContainer, parentComponent)

    }   


    function patch(vnode, container, parentComponent) {

        switch (vnode.type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (vnode.shapeFlag & ShapeFlags.ELEMENTS) {
                    processElement(vnode, container, parentComponent)
                } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
        
    }

    function processText (vnode, container) {
        const ctx = document.createTextNode(vnode.children);
        container.appendChild(ctx)
    }

    function processFragment (vnode, container, parentComponent) {
        mountChildren(vnode.children, container, parentComponent)
    }

    function processElement (vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }

    function mountElement (vnode, container, parentComponent) {
        const { type, props, children } = vnode;
        const el = (vnode.el = hostCreateElement(type));
        for(const key in props) {
            hostPatchProp(el, key, props[key])
        }
        if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parentComponent);
        } else {
            el.textContent = children;
        }
        hostInsert(el, container)
    }

    function mountChildren(children, container, parentComponent) {
        children.forEach(_vnode => {
            patch(_vnode, container, parentComponent)
        })
    }

    function processComponent (vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }

    function mountComponent(vnode, container, parentComponent) {
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance)
        setupRenderEffect(instance, container)
    }

    function setupRenderEffect(instance, container) {
        const subTree = instance.render.call(instance.proxy);
        patch(subTree, container, instance);

        instance.el = subTree.el
    }

    return {
        createApp: createAppApi(render)
    }
}
