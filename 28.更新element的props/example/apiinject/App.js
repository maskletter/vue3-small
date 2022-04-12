import { h, createTextVnode, provide, inject } from '../../lib/mini-vue.esm.js'

const ProviderOne = {
    name: 'ProviderOne',
    render() {
        return h('div', {
            id: 'root',
            class: ['yellow'],
            
        }, [
            createTextVnode('ProviderOne'),
            h(Center)
        ])
    },

    setup() {
        provide('name', 'tom');
        provide('age', 18);
        return {
            msg: 'hello, world'
        }
    }

}
const Center = {
    name: 'Center',
    render() {
        return h('div', {}, [
            createTextVnode('Center, '+this.age), //h(Foo)
        ])
    },
    setup() {
        const age = inject('age')
        provide('age', 21);
        return {
            age
        }
    }
}
const Foo = {
    name: 'Foo',
    render() {
        return h('div', {}, [
            createTextVnode('Foo, '), createTextVnode(this.age)
        ])
    },
    setup() {
        const age = inject('age')
        return {
            age
        }
    }
}
export default {
    name: "App",
    setup() {
    },
    render() {
        return h("div", {}, [h("p", {}, "apiInject"), h(ProviderOne)])
    }
  };
  