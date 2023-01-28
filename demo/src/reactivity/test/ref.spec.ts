import { effect } from "../effect";
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref, unRef } from "../ref";


describe('ref', () => {

    it('happy path', () => {

        const a = ref(1);

        expect(a.value).toBe(1);

    })

    it('should be reactive', () => {

        const a = ref(1);
        let dummy;
        let calls = 0;
        effect(() => {
            calls++;
            dummy = a.value;
        })

        expect(dummy).toBe(a.value);
        expect(calls).toBe(1);

        a.value = 2;

        expect(calls).toBe(2);

        a.value = 2;
        expect(calls).toBe(2);
        // expect(calls).toBe(2);
        
    })

    it('should make nested properties reactive', () => {
        const a = ref({ count: 1 });
        let dummy;
        effect(() => {
            dummy = a.value.count;
        })
        expect(dummy).toBe(1)
        a.value.count = 2;
        expect(dummy).toBe(2)
    })

    it('isRef', () => {
        const a = ref(1);
        const user = reactive({ foo:1 });
        expect(isRef(a)).toBe(true);
        expect(isRef(true)).toBe(false);
        expect(isRef(user)).toBe(false);
    })

    it('unRef', () => {
        const a = ref(1);
        expect(unRef(a)).toBe(1);
    })

    it('proxyRefs', () => {

        const user = {
            age: ref(18),
            name: 'tom'
        }

        const data = proxyRefs(user);

        expect(data.name).toBe('tom');
        expect(data.age).toBe(18);
        expect(user.age.value).toBe(18);
        
        user.age.value = 14;
        expect(data.age).toBe(14);
        user.name = 'job';
        expect(data.name).toBe('job');
        data.age = 99 as any;
        expect(data.age).toBe(99);

    })

})