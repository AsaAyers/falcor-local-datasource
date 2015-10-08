import Rx from 'rx'
import walk from './walk'

export class FalcorSource {
    constructor(schema) {
        this.schema = schema
    }

    get(pathSets) {
        const x = path => walk(this.schema, path)

        const promise = Promise.all(pathSets.map(x)).then((x) => {
            return {
                jsonGraph: x[0]
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
