import test from 'tape'
import set from '../src/set'

test('set', assert => {
    const data = {
        a: 1,
        foo: {
            b: 2,
            bar: {
                baz: null
            }
        }
    }
    const expected = {
        a: 1,
        foo: {
            b: 2,
            bar: {
                baz: 'VALUE'
            }
        }
    }

    const actual = set(data, ['foo', 'bar', 'baz'], 'VALUE')

    assert.deepEqual(actual, expected)
    assert.end()
})
