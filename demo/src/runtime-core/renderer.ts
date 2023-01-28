import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";


export function render(rootComponent, container) {
    patch(null, rootComponent, container)
}

export function patch(n1, n2, container) {
    // switch (n2.shapeFlag) {
    //     case value:
            
    //         break;
    
    //     default:
    //         break;
    // }
    if (n2.shapeFlag & ShapeFlags.ELEMENTS) {
        console.log('element', n2)
        processElement(n1, n2, container)
    } else {
        processComponent(n1, n2, container)
    }
    
}
export function processElement(n1, n2, container) {
    if (!n1) {
        mountElement(n2, container)
    }
}
export function mountElement(element, container) {
    const el = document.createElement(element.type);
    for(const key in element.props) {
        el.setAttribute(key, element.props[key])
    }
    if (Array.isArray(element.children)) {
        element.children.forEach(element => {
            patch(null, element, container)
        });
        
    } else {
        el.textContent = element.children
    }

    container.appendChild(el)
}

export function processComponent(n1, n2, container) {
    if (!n1) {
        mountComponent(n2, container)
    }
}

export function mountComponent(component, container) {

    const instance: any = createComponentInstance(component);
    setupComponent(instance)

    effect(() => {
        const vnode = instance.render.call(instance.setupResult)
        patch(null, vnode, container)
    })

}