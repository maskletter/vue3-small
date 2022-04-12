import { effect } from '../effect';
import { isReactive, reactive } from '../reactive'

describe('reactive', () => {
    it('happly path', () => {

        const original = { age: 10 };
        const user = reactive(original)
        
        expect(user).not.toBe(original);
        expect(user.age).toBe(10)
        expect(isReactive(user)).toBe(true);
        expect(isReactive(original)).toBe(false);

    })
})
