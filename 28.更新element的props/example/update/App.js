import { createTextVnode, h, ref } from "../../lib/mini-vue.esm.js"

export default {
    name: 'App',
    setup() {
        const count = ref(0);
        const onClick = () => {
            count.value++;
        }
        const props = ref({
            foo: 'foo',
            bar: 'bar'
        })
        const changePropFoo = () => {
            props.value.foo = 'new-foo'
        }
        const deletePropFoo = () => {
            props.value.foo = undefined
        }
        const replacePropFoo = () => {
            props.value = {

            }
        }
        return {
            count, onClick, props,
            changePropFoo,
            deletePropFoo,
            replacePropFoo
        }
    },
    render() {
        return h('div', { ...this.props }, [
            h('h1',{}, 'element update'),
            createTextVnode(`count:${this.count}`),
            h('div', {}, [
                h('button', { onClick: this.changePropFoo }, 'changePropFoo'),
                h('button', { onClick: this.deletePropFoo }, 'deletePropFoo'),
                h('button', { onClick: this.replacePropFoo }, 'replacePropFoo'),
            ])
        ])
    }
}