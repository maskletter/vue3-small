import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentRenderUtils";
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

    function render(n2, rootContainer, parentComponent, anchor) {

        patch(null, n2, rootContainer, parentComponent, anchor)

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
                if (n2.shapeFlag & ShapeFlags.ELEMENTS) {
                    processElement(n1, n2, container, parentComponent, anchor)
                } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }

    }

    function processText(n1, n2, container) {
        if (!n1) {
            const ctx = (n2.el = document.createTextNode(n2.children));
            container.appendChild(ctx)
        } else {
            n2.el = n1.el;
            n2.el.nodeValue = n2.children
            console.log(222)
        }
        
    }

    function processFragment(vnode, container, parentComponent, anchor) {
        mountChildren(vnode.children, container, parentComponent, anchor)
    }

    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n1, n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
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

        if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(n1.children);
            }
            if (c1 != c2) {
                hostSetElementText(container, n2.children);
            }
        } else if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                hostSetElementText(container, '');
                mountChildren(n2.children, container, parentComponent, anchor);
            }
        } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN && nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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
        }
        // 从左开始对比
        while (i <= e2 && i <= e1) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break;
            }
            i++;
        }
        // 从右开始对比
        while (i <= e2 && i <= e1) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < c2.length ? c2[nextPos].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        } else if (i > e2) {
            // 旧的比新的多时候的情况
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++
            }
        } else {
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
                    container;
                }
                let newIndex;
                if (prevChldren.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChldren.key);
                } else {
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
                } else {

                    if (newIndex >= maxNewIndexSofar) {
                        maxNewIndexSofar = newIndex
                    } else {
                        moved = true;
                    }

                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChldren, c2[newIndex], container, parentComponent, null)
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChildren = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

                if (newIndexToOldIndexMap[i] == 0) {
                    patch(null, nextChildren, container, parentComponent, anchor)
                } else if (moved) {
                    if (j < 0 || j != increasingNewIndexSequence[i]) {
                        // 移动
                        hostInsert(nextChildren.el, container, parentComponent, anchor)
                    } else {
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

    function mountElement(n1, n2, container, parentComponent, anchor) {
        const { type, props, children } = n2;
        const el = (n2.el = hostCreateElement(type));
        for (const key in props) {
            hostPatchProp(el, key, null, props[key])
        }
        if (n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parentComponent, anchor);
        } else {
            el.textContent = children;
        }
        hostInsert(el, container, anchor)
    }

    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(_vnode => {
            patch(null, _vnode, container, parentComponent, anchor)
        })
    }

    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        } else {
            updateComponent(n1, n2);
        }
    }

    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        } else {
            n2.el = n1.el;
            n2.vnode = n2
        }
       
    }

    function mountComponent(vnode, container, parentComponent, anchor) {
        const instance = (vnode.component = createComponentInstance(vnode, parentComponent));
        setupComponent(instance)
        setupRenderEffect(instance, container, anchor)
    }

    function setupRenderEffect(instance, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                patch(null, subTree, container, instance, anchor);
                instance.el = subTree.el
                instance.isMounted = true;
            } else {
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
        })
    }

    function updateComponentPreRender(instance, nextVNode) {
        instance.vnode = nextVNode;
        instance.next = null
        instance.props = nextVNode.props
    }

    return {
        createApp: createAppApi(render)
    }
}


// 最长递增子序列
function getSequence(arr: number[]): number[] {
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
                } else {
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
