import { h } from '../../lib/mini-vue.esm.js'
import ArrayToText from './ArrayToText.js'
import TextToText from './TextToText.js'
import TextToArray from './TextToArray.js'
import ArrayToArray from './ArrayToArray.js'

export default {
    name: 'App',
    setup() {
     
        return {
        }
    },
    render() {
        return h('div', {}, [
            h('h1', {}, 'App'),
            // h(ArrayToText),
            // h(TextToText),
            // h(TextToArray),
            h(ArrayToArray)
        ])
    }
}