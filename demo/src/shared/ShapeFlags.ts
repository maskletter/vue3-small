

export const enum ShapeFlags {

    ELEMENTS = 1,                   // 1,       0001
    STATEFUL_COMPONENT = 1 << 1,    // 10,      0010
    TEXT_CHILDREN = 1 << 2,         // 100,     0100
    ARRAY_CHILDREN = 1 << 3,        // 1000,    1000
    SLOT_CHILDREN = 1 << 4
}
