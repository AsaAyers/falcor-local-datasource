import set from './set'
import { error as graphError } from 'falcor-json-graph'

function getIn(obj, path) {
    return path.reduce((current, key) => {
        return current[key]
    }, obj)
}

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

// returns a jsonGraphEnvelope
// http://netflix.github.io/falcor/doc/global.html#JSONGraphEnvelope
export default function walk(schemaRoot, ...paths) {
    // This will get built up to contain exactly the values the user asked for
    let jsonGraph = {}
    const step = (schemaFragment, [nextKey, ...tail], past = []) => {
        let currentPath
        const next = (value) => {
            if (tail.length) {
                return step(value, tail, [...past, nextKey])
            }
            if (!isGraphPrimative(value)) {
                warn('Value is not primative', currentPath, value)
            }
            jsonGraph = set(jsonGraph, currentPath, value)
        }

        // nextKey needs special handling if it's range or index
        // { from: 0, to: 3}
        // [ 'a', 'b', 'c' ]
        if (typeof nextKey === 'object') {
            const branches = selectorToArray(nextKey).map((key) => {
                return step(schemaFragment, [key, ...tail], past)
            })

            // We don't actually need the value from the Promise because as
            // these complete they will wrote to the jsonGraph variable
            return Promise.all(branches)
        }

        currentPath = [...past, nextKey]
        if (schemaFragment == null) {
            jsonGraph = set(jsonGraph, currentPath,
                graphError(`Invalid path: ${JSON.stringify(currentPath)}`))
            return
        }

        let nextFragment = schemaFragment[nextKey]
        if (typeof nextFragment === 'object' && nextFragment['$type'] === 'ref') {
            jsonGraph = set(jsonGraph, currentPath, nextFragment)

            const value = getIn(schemaRoot, nextFragment.value)
            return step(value, tail, nextFragment.value)

        }

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
    ).then(() => ({
        paths,
        jsonGraph
    }))
}
