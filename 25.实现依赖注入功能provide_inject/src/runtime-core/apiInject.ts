import { getCurrentInstance } from "./component"


export function provide(key, value) {
    const currentInstance: any = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (parentProvides == currentInstance.provides) {
            provides = currentInstance.provides = Object.create(parentProvides)    
        }
        provides[key] = value;
    }
}
export function inject(key) {

    const currentInstance: any = getCurrentInstance();

    if (currentInstance) {

        return currentInstance.parent.provides[key]
        
    }


}