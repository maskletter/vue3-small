import { h } from '../../lib/mini-vue.esm.js'

export default {

    render() {
        return h('div', 'hi'+this.msg)
    },

    setup() {
        return {
            msg: 'hello, world'
        }
    }

}