import { isReadonly, shallowReadonly } from "../reactive";

describe('shallowReadonly', () => {

    it('happy path', () => {

        const original = { foo: 1 , bar: { foor: 2} };
        const wrapped = shallowReadonly(original)
        expect(isReadonly(wrapped)).toBe(true);
        expect(isReadonly(wrapped.bar)).toBe(false)

    })

    it('warn when call set', () => {

        console.warn = jest.fn();
        const original = { foo: 1 , bar: { foor: 2} };
        const wrapped = shallowReadonly(original)
        wrapped.bar.foo = 2;
        expect(console.warn).not.toHaveBeenCalled();
        wrapped.foo = 2;
        expect(console.warn).toHaveBeenCalled();

    })

})