import { h, renderSlots, getCurrentInstance, createTextVnode } from '../../lib/mini-vue.esm.js'

export default {

    name: 'Foo',
    setup(props) {

        // return {
        //     msg: 'hello, world'
        // }
    },
    render() {
        // return h('div', {}, 'Hello,' + this.$props.msg)
        return h("div", {}, [h("div", {}, "child" + this.$props.msg)]);
        // return h('div', {}, [
        //     // h('h1', {}, )
        //     createTextVnode('Hello,' + this.$props.msg)
        // ])
    }

}