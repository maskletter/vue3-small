const updates: any[] = [];
let isFlushPending = false;

export function nextTick (fn) {
    return fn ? Promise.resolve().then(fn) : Promise.resolve()
}

export function queueJob(fn) {

    if (!updates.includes(fn)) {
        updates.push(fn)
        nextTick(queueFlush)
    }

}

function queueFlush() {
    if (!isFlushPending) return;
    isFlushPending = false;
    let job;
    while (job = updates.shift()) {
        job && job();
    }
}