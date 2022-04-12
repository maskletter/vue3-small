import { createTextVnode, h, ref } from "../../lib/mini-vue.esm.js"

export default {
    name: 'App',
    setup() {
        const count = ref(0);
        const onClick = () => {
            count.value++;
        }
        return {
            count, onClick
        }
    },
    render() {
        return h('div', {}, [
            h('h1',{}, 'element update'),
            createTextVnode(`count:${this.count}`),
            h('div', {}, [ h('button', { onClick: this.onClick }, 'count++') ])
        ])
    }
}