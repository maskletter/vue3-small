
const publicPropertiesMap = {
    $el: i => i.el,
}


export const componentPlulicInstance = {

    get({_: instance}, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key]
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance)
        }
    }

}