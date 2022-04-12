import { h } from '../../lib/mini-vue.esm.js'

export default {

    render() {
        return h('div', {
            id: 'root',
            class: ['yellow']
        }, [
            h('div', { class: 'red' }, 'hello'),
            h('div', { class: 'blue' }, 'world')
        ])
    },

    setup() {
        return {
            msg: 'hello, world'
        }
    }

}