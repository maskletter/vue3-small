

export const enum ShapeFlags {

    ELEMENTS = 1,                   // 1,       0001
    STATEFUL_COMPONENT = 1 << 1,    // 10,      0010
    TEXT_CHILDREN = 1 << 2,         // 100,     0100
    ARRAY_CHILDREN = 1 << 3         // 1000,    1000

}


/**
 
const test1 = ShapeFlags.ELEMENTS;

const test2 = ShapeFlags.ELEMENTS | ShapeFlags.TEXT_CHILDREN;

console.log(test2 & ShapeFlags.TEXT_CHILDREN, test2 & ShapeFlags.ELEMENTS)
         // true, true

console.log(test2 & ShapeFlags.STATEFUL_COMPONENT)
         // false


const test3 = ShapeFlags.ELEMENTS | ShapeFlags.TEXT_CHILDREN | ShapeFlags.STATEFUL_COMPONENT; 


console.log(test3 & ShapeFlags.STATEFUL_COMPONENT)
         // true


 */