import test from 'tape'
import walk from '../src/walk.js'

const testData = {
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
    }
}


test('walk plain value', assert => {
    const expected = {
        foo: {
            bar: {
                baz: 'foo.bar.baz'
            }
        }
    }
    walk(testData, ['foo', 'bar', 'baz']).then((actual) => {
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
    walk(testData, ['foo', 'bar', ['baz', 'qux']]).then((actual) => {
        assert.deepEqual(actual, expected)
        assert.end()
    })

})

test('walk simple function', assert => {
    const expected = {
        greeting: 'hello'
    }

    walk(testData, ['greeting']).then((actual) => {
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

    walk(testData, ['range', { from: 0, to: 2 }, 'name']).then((actual) => {
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

    walk(testData, ['range', { from: 3, to: 5 }, 'name']).then((actual) => {
        // deepEqual didn't seem to work here. Maybe it doesn't work with arrays?
        assert.equal(JSON.stringify(actual, null, 2), JSON.stringify(expected, null, 2))
        assert.end()
    })
})

test('walk to a promised value', assert => {
    const expected = {
        asyncGreeting: 'hello'
    }

    walk(testData, ['asyncGreeting']).then((actual) => {
        assert.deepEqual(actual, expected)
        assert.end()
    })
})
