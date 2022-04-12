import { h } from '../../lib/mini-vue.esm.js'
import Foo from './Foo.js'

export default {

    render() {
        setTimeout(() => {
            console.log(this.$el)
        })
        return h('div', {
            id: 'root',
            class: ['yellow'],
            
        }, [
            h(Foo, {
                name: '张三',
                onChange() {
                    console.log('接收Foo的emit')
                },
                onNameChange(name, value) {
                    console.log('接收Foo的emit:name', name, value)
                }
            })
        ])
    },

    setup() {
        return {
            msg: 'hello, world'
        }
    }

}