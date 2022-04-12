import { createTextVnode, h, ref } from "../../lib/mini-vue.esm.js"

const nextChildren = "newChildren";
const prevChildren = [
    h('div', {}, 'A'),
    h('div', {}, 'B')
]

export default {
    name: 'ArrayToText',
    setup() {
        const change = ref(false)
        window.change = change
        return {
            change
        }
    },
    render() {
        return this.change ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
        // return h('div', {}, this.change ? [
        //     h('div', {}, 'A'),
        //     h('div', {}, 'B')
        // ] : createTextVnode('Text'))
    }
}