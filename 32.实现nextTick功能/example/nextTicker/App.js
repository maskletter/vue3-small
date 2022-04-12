import { createTextVnode, effect, h, ref } from '../../lib/mini-vue.esm.js'

export default {

    render() {
        
        return h('div', {
            id: 'root',
            class: ['yellow'],
            
        }, [
            h('div', { class: 'red', onClick() {
                console.log('aaa')
            } }, 'hello'),
            h('button', { onClick: this.onClick }, '测试'),
            h('h1', {}, [createTextVnode('this.data'+this.data)])
        ])
    },

    setup() {
       
        const data = ref(1);
        const onClick = () => {
            let i = 0;
            while (i < 2) {
                data.value++;
                i++;
            }
        }
        return {
            msg: 'hello, world',
            data, onClick
        }
    }

}