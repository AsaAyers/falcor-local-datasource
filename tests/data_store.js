import test from 'tape'
import DataStore from '../src/data_store'
import { Model } from 'falcor'
import { ref as $ref } from 'falcor-json-graph'

function setupModel() {
    const source = new DataStore({
        todo({from, to}) {
            const data = {}
            for (let id = from; id <= to; id++) {
                data[id] = {
                    id,
                    name: 'Todo ' + id,
                    complete: false,
                }
            }
            // return data
            return Promise.resolve(data)
        },
        todosWithRefs({from, to}) {
            const data = {}
            for (let id = from; id <= to; id++) {
                data[id] = $ref(['todosById', id])
            }
            // return data
            return Promise.resolve(data)
        }
    })

    return new Model({
        source,
    })
}

test('DataStore basic query', assert => {
    const expected = {
        todo: {
            0: { complete: false, id: 0, name: 'Todo 0' },
            1: { complete: false, id: 1, name: 'Todo 1' },
            2: { complete: false, id: 2, name: 'Todo 2' },
            3: { complete: false, id: 3, name: 'Todo 3' }
        }
    }

    const model = setupModel()
    model.get('todo[0..3]["id", "name", "complete"]').then((actual) => {
        assert.deepEqual(actual.json, expected)
        assert.end()
    })

})

test.skip('DataStore with refs', assert => {
    const expected = {
        todo: {
            0: { complete: false, id: 0, name: 'Todo 0' },
            1: { complete: false, id: 1, name: 'Todo 1' },
            2: { complete: false, id: 2, name: 'Todo 2' },
            3: { complete: false, id: 3, name: 'Todo 3' }
        }
    }

    const model = setupModel()
    model.get('todosWithRefs[0..3]["id", "name", "complete"]').then((actual) => {
        assert.deepEqual(actual.json, expected)
        assert.end()
    })

})
