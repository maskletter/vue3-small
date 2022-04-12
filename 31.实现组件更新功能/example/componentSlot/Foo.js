import { h, renderSlots, getCurrentInstance } from '../../lib/mini-vue.esm.js'

export default {

    name: 'Foo',
    setup(props) {

        return {
            msg: 'hello, world'
        }
    },
    render() {
        const age = 18;
        return h('div', {}, [
            renderSlots(this.$slots, 'header', { age }),
            h('h1', {}, 'Hello, world:'+this.name),
            renderSlots(this.$slots, 'footer')
        ])
    }

}