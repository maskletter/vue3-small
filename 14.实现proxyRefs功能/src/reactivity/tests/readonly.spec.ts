import { isProxy, isReadonly, readonly } from "../reactive";

describe('readonly', () => {

    it('happy path', () => {

        const original = { foo: 1, bar: { foo: 2 } };

        const wrapped = readonly(original);

        expect(wrapped).not.toBe(original);
        expect(wrapped.foo).toBe(1)


        expect(isReadonly(wrapped)).toBe(true);
        expect(isReadonly(original)).toBe(false);

        expect(isReadonly(wrapped.bar)).toBe(true);
        expect(isReadonly(original.bar)).toBe(false);

        expect(isProxy(wrapped.bar)).toBe(true);

    })

    it('warn when call set', () => {
        console.warn = jest.fn();
        const original = { foo: 1 };
        const wrapped = readonly(original);
        wrapped.foo = 2;
        expect(console.warn).toHaveBeenCalledTimes(1);
    })
})