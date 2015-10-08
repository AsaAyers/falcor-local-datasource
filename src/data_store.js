import Rx from 'rx'
import walk from './walk'

export class FalcorSource {
    constructor(schema) {
        this.schema = schema
    }

    get(pathSets) {
        const promise = walk(this.schema, ...pathSets).then((jsonGraph) => {
            return {
                jsonGraph
            }
        })

        return Rx.Observable.fromPromise(promise)
    }

    call(functionPath, args, refSuffixes, thisPaths) {
        console.log('call', ...arguments)

    }

    set(jsonGraphEnvelope) {
        console.log('set', ...arguments)

    }
}
