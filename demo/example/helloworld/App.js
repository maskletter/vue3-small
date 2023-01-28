import { h } from '../../lib/mini-vue.esm.js'

export default {
    name: 'App',
    setup() {
        return {
            msg: 'tom'
        }
    },
    render() {
        // return h('div', {}, 'Hello,'+this.msg)
        return h('div', {}, [
            h('h1', { class: 'a' }, 'aaa'),
            h('h1', {
                class: 'b'
            }, 'bbb')
        ])
    }
}