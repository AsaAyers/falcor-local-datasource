import Rx from 'rx'
import walk from './walk'

export default class DataStore {
    constructor(schema) {
        this.schema = schema
    }

    get(pathSets) {
        const promise = walk(this.schema, ...pathSets)

        return Rx.Observable.fromPromise(promise)
    }

    call(functionPath, args, refSuffixes, thisPaths) {
        console.log('call', ...arguments)

    }

    set(jsonGraphEnvelope) {
        console.log('set', ...arguments)

    }
}
