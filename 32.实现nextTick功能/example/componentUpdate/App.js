import { h, effect, reactive, ref } from '../../lib/mini-vue.esm.js'
import Foo from './Foo.js'

export default {
    name: 'App',
    render() {

        return h('div', {
            id: 'root',
            class: ['yellow'],

        }, [
            h('h1', {
                class: 'red', onClick() {
                    console.log('aaa')
                }
            }, 'App:'+this.data.count),
            h('button', {
                onClick: this.changeChildProps
            }, '测试'),
            h(Foo, {
                name: '张三',
                msg: this.msg
            })
        ]
        )
    },

    setup() {
        const msg = ref('tom')
        const data = reactive({ count: 10 })
        const changeChildProps = () => {
            data.count++;
        };
    
        window.msg = msg;
        // effect(() => {
        //     console.log('触发')
        // })
        return {
            msg, data, changeChildProps
        }
    }

}