import { effect } from '../effect';
import { reactive } from '../reactive'

describe('reactive', () => {
    it('happly path', () => {

        const original = { age: 10 };
        const user = reactive(original)

        expect(user).not.toBe(original);
        expect(user.age).toBe(10)

    })
})
