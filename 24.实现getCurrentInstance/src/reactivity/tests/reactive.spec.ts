import { isProxy, isReactive, reactive } from '../reactive'

describe('reactive', () => {
    it('happly path', () => {

        const original = { age: 10, bar: { name: 'tom' } };
        const user = reactive(original)
        
        expect(user).not.toBe(original);
        expect(user.age).toBe(10)
        expect(isReactive(user)).toBe(true);
        expect(isReactive(original)).toBe(false);

        expect(isReactive(user.bar)).toBe(true);
        expect(isReactive(original.bar)).toBe(false);


        expect(isProxy(user.bar)).toBe(true);

    })
})
