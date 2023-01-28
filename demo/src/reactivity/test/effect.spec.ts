import { effect, stop } from '../effect';
import { reactive } from '../reactive'

describe('effect', () => {

    it('happy path', () => {

        const user = reactive({
            age: 10
        })

        let nextAge = 0;

        effect(() => {
            nextAge = user.age + 1
        });

        expect(nextAge).toBe(11);

        user.age++;

        expect(nextAge).toBe(12);

    })

    it('should return runner when call effect', () => {

        let foo = 10;

        const runner = effect(() => {
            foo++;
            return 'foo'
        })

        expect(foo).toBe(11);
        const r = runner();
        expect(foo).toBe(12);
        expect(r).toBe('foo');

    })

    it('scheduler', () => {

        let run: any;
        const scheduler = jest.fn(() => {
            run = runner;
        })
        const obj = reactive({ foo: 1 });
        let dummy = 0;
        const runner = effect(() => {
            dummy = obj.foo;
        }, { scheduler })

        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        expect(dummy).toBe(1);
        run();
        expect(dummy).toBe(2);

    })
    
    it('stop', () => {

        let dumy;
        const obj = reactive({ prop: 1  })

        const runner = effect(() => {
            dumy = obj.prop;
        })
        obj.prop = 2;
        expect(dumy).toBe(2);
        stop(runner);
        obj.prop = 3;
        expect(dumy).toBe(2);
        // console.log('++')
        obj.prop++;
        expect(dumy).toBe(2);

        runner();

        expect(dumy).toBe(4)

    })

    it('onStop', () => {
        let dumy;
        const obj = reactive({ prop: 1  })
        const onStop = jest.fn();

        const runner = effect(() => {
            dumy = obj.prop;
        }, { onStop })

        expect(dumy).toBe(1)
        expect(onStop).not.toHaveBeenCalled();
        stop(runner);
        expect(onStop).toHaveBeenCalledTimes(1);

    })

})