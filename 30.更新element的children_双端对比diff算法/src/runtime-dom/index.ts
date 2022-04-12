import { createRenderer } from "../runtime-core/renderer";


const isOn = key => /^on[A-Z]/.test(key)
const event = name => name.slice(2).toLowerCase();

export function createElement(type) {
    return document.createElement(type)
}

export function patchProp(el, key, prevProp, nextProp) {
    if (isOn(key)) {
        el.addEventListener(event(key), nextProp)
    } else {
        if (nextProp === undefined || nextProp === null) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, nextProp)
        }
    }
}

export function insert(el, parent, anchor = null) {
    // parent.appendChild(el);
    parent.insertBefore(el, anchor)
}

export function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el)
    }
}

export function setElementText(el, text) {
    el.textContent = text;
}

const renderer: any = createRenderer({
    createElement, patchProp, insert, remove, setElementText
})

export function createApp(...argv) {
    return renderer.createApp(...argv)
}

export * from '../runtime-core'