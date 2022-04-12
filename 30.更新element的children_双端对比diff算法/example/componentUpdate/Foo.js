import { h, renderSlots, getCurrentInstance, createTextVnode } from '../../lib/mini-vue.esm.js'

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
            h('h1', {}, [createTextVnode('Hello')])
        ])
    }

}