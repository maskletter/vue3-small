import { render } from "./renderer"


export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            render(rootComponent, rootContainer)
        }
    }
}