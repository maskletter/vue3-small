import { h, createTextVnode } from '../../lib/mini-vue.esm.js'
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
            h('h1', { class: 'red', onClick() {
                console.log('aaa')
            } }, 'App'),
            h(Foo, {
                name: '张三'
            }, {
                header: ({age}) => h('div', {}, 'app-slots:header,'+age),
                footer: () => h('div', {}, [
                    h('span', {}, 'span:-'),
                    createTextVnode('app-slots:footer')
                ])
            })
        ])
    },

    setup() {
        return {
            msg: 'hello, world'
        }
    }

}