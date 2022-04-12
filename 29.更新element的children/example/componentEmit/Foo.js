import { h } from '../../lib/mini-vue.esm.js'

export default {

    name: 'Foo',
    setup(props, { emit }) {
        const emitInput = () => {
            // emit('hello, world')
            emit('change')
        }
        const emitInputName = () => {
            emit('name-change', 'tom', '123456')
        }
        return {
            msg: 'hello, world',
            emitInput,
            emitInputName
        }
    },
    render() {

        return h('h1', {}, [
            h('div', {}, 'Hello, world:'+this.name),
            h('button', { onClick: this.emitInput }, '测试点击'),
            h('button', { onClick: this.emitInputName }, '测试点击:name')
        ])
    }

}