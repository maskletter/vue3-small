import { camelize, toHandlerKey } from "../shared/index";


export function emit (instance, event, ...argv) {
    const {props} = instance
    

    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...argv)

}