import test from 'tape'
import walk from '../src/walk.js'
import { ref as $ref } from 'falcor-json-graph'

const testData = {
    users: {
        1: {
            name: "Asa Ayers"
        }
    },
    me: $ref(['users', 1]),
    foo: {
        bar: {
            baz: "foo.bar.baz",
            qux: "foo.bar.qux"
        }
    },
    greeting() {
        return 'hello'
    },
    range({from, to}) {
        if ( to > 10 ) {
            to = 10
        }

        const data = {}
        for (let id = from; id <= to; id++) {
            data[id] = {
                id,
                name: 'name' + id
            }
        }
        // return data
        return Promise.resolve(data)
    },
    asyncGreeting() {
        return Promise.resolve('hello')
    },
    letters: {
        a: { id: 1 },
        b: { id: 2 },
    },
    a: { id: 1 },
    b: { id: 2 },
}


test('walk plain value', assert => {
    const expected = {
        foo: {
            bar: {
                baz: 'foo.bar.baz'
            }
        }
    }
    walk(testData, ['foo', 'bar', 'baz']).then(({ jsonGraph: actual }) => {
        assert.deepEqual(actual, expected)
        assert.end()
    })
})

test('walk multiple values', assert => {
    const expected = {
        foo: {
            bar: {
                baz: 'foo.bar.baz',
                qux: 'foo.bar.qux'
            }
        }
    }
    walk(testData, ['foo', 'bar', ['baz', 'qux']]).then(({ jsonGraph: actual }) => {
        assert.deepEqual(actual, expected)
        assert.end()
    })

})

test('walk simple function', assert => {
    const expected = {
        greeting: 'hello'
    }

    walk(testData, ['greeting']).then(({ jsonGraph: actual }) => {
        assert.deepEqual(actual, expected)
        assert.end()
    })
})

test('walk with a range', assert => {
    const expected = {
        range: {
            0: { name: 'name0' },
            1: { name: 'name1' },
            2: { name: 'name2' },
        }
    }

    walk(testData, ['range', { from: 0, to: 2 }, 'name']).then(({ jsonGraph: actual }) => {
        // deepEqual didn't seem to work here. Maybe it doesn't work with arrays?
        assert.equal(JSON.stringify(actual), JSON.stringify(expected))
        assert.end()
    })
})

test('walk with a non-zero range', assert => {
    const expected = {
        range: {
            3: { name: 'name3' },
            4: { name: 'name4' },
            5: { name: 'name5' },
        }
    }

    walk(testData, ['range', { from: 3, to: 5 }, 'name']).then(({ jsonGraph: actual }) => {
        // deepEqual didn't seem to work here. Maybe it doesn't work with arrays?
        assert.equal(JSON.stringify(actual, null, 2), JSON.stringify(expected, null, 2))
        assert.end()
    })
})

test('walk to a promised value', assert => {
    const expected = {
        asyncGreeting: 'hello'
    }

    walk(testData, ['asyncGreeting']).then(({ jsonGraph: actual }) => {
        assert.deepEqual(actual, expected)
        assert.end()
    })
})

test('walk accepts multiple path parameters', assert => {
    const expected = {
        greeting: 'hello',
        asyncGreeting: 'hello',
    }

    const paths = [
        ['greeting'],
        ['asyncGreeting'],
    ]

    walk(testData, ...paths).then(({ jsonGraph: actual }) => {
        assert.deepEqual(actual, expected)
        assert.end()
    })
})

test('walk can walk through refs', assert => {
    const expected = {
        me: { $type: 'ref', value: [ 'users', 1 ] },
        users: {
            1: { name: 'Asa Ayers' }
        }
    }

    walk(testData, ['me', 'name']).then(({ jsonGraph: actual }) => {
        assert.deepEqual(actual, expected)
        assert.end()
    })

})

test("walk doesn't break when you overreach ranges", assert => {
    const expected = {
        range: {
            8: { name: 'name8' },
            9: { name: 'name9' },
            10: { name: 'name10' },
            11: null,
            12: null,
        }
    }

    walk(testData, ['range', { from: 8, to: 12 }, 'name']).then(({ jsonGraph: actual }) => {
        // deepEqual didn't seem to work here. Maybe it doesn't work with arrays?
        assert.equal(JSON.stringify(actual), JSON.stringify(expected))
        assert.end()
    })
})
