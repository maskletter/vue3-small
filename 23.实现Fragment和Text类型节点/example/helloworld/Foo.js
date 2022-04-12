import { h } from '../../lib/mini-vue.esm.js'

export default {

    name: 'Foo',
    setup(props) {
        return {
            msg: 'hello, world'
        }
    },
    render() {
        return h('h1', {}, 'Hello, world:'+this.name)
    }

}