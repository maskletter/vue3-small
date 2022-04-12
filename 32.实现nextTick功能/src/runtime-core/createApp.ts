import { createVnode } from "./vnode";



export function createAppApi(renderer) {
    return function render(rootComponent) {
        return {
            mount(rootContainer) {
    
                const vnode = createVnode(rootComponent);
    
                renderer(vnode, rootContainer);
    
            }
        }
    }
}
// export function createApp(rootComponent) {

//     return {
//         mount(rootContainer) {

//             const vnode = createVnode(rootComponent);

//             render(vnode, rootContainer);

//         }
//     }

// }