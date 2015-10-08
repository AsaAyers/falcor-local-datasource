import set from './set'
import { error as graphError } from 'falcor-json-graph'

const warn = (...args) => {
    console.warn(...args) // eslint-disable-line no-console
}

const isPromise = (v) => v != null && typeof v.then === 'function'

const graphPrimatives = [ 'ref', 'atom', 'error' ]
const isGraphPrimative = v => typeof v !== 'object' || (
    typeof v['$type'] != undefined &&
    graphPrimatives.indexOf(v['$type']) > 0
)

const selectorToArray = (selector) => {
    // looks like an array
    if (typeof selector.map === 'function') {
        return selector
    }

    if (selector.from != null && selector.to != null) {
        const branches = []
        for (let i = selector.from; i <= selector.to; i++) {
            branches.push(i)
        }
        return branches
    }

    throw new Error('Unknown selector format')
}

export default function walk(schemaRoot, ...paths) {
    // This will get built up to contain exactly the values the user asked for
    let data = {}
    const step = (schemaFragment, [nextKey, ...tail], past = []) => {
        const next = (value) => {
            if (tail.length) {
                return step(value, tail, [...past, nextKey])
            }
            if (!isGraphPrimative(value)) {
                warn('Value is not primative', currentPath, value)
            }
            data = set(data, currentPath, value)
        }

        // nextKey needs special handling if it's range or index
        // { from: 0, to: 3}
        // [ 'a', 'b', 'c' ]
        if (typeof nextKey === 'object') {
            const branches = selectorToArray(nextKey).map((key) => {
                return step(schemaFragment, [key, ...tail], past)
            })

            // We don't actually need the value from the Promise because as
            // these complete they will wrote to the data variable
            return Promise.all(branches)
        }

        const currentPath = [...past, nextKey]
        if (schemaFragment == null) {
            data = set(data, currentPath,
                graphError(`Invalid path: ${JSON.stringify(currentPath)}`))
            return
        }

        let nextFragment = schemaFragment[nextKey]
        if (typeof nextFragment === 'function') {
            nextFragment = nextFragment(...tail)
            if (isPromise(nextFragment)) {
                return nextFragment.then(next)
            }
        }
        return next(nextFragment)
    }

    return Promise.all(
        paths.map(p => step(schemaRoot, p))
    ).then(() => data)
}