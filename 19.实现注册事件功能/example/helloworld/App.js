import { h } from '../../lib/mini-vue.esm.js'

export default {

    render() {
        setTimeout(() => {
            console.log(this.$el)
        })
        return h('div', {
            id: 'root',
            class: ['yellow'],
            
        }, [
            h('div', { class: 'red', onClick() {
                console.log('aaa')
            } }, 'hello'),
            h('div', { class: 'blue', onClick() {
                console.log('bbb')
            }}, 'world'),
            h('div', { class: 'black' }, this.msg)
        ])
    },

    setup() {
        return {
            msg: 'hello, world'
        }
    }

}