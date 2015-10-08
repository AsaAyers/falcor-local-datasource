
export default function set(obj, path, setValue) {
    function step(obj = {}, [head, ...tail]) {
        if (tail.length) {
            return {
                ...obj,
                [head]: step(obj[head], tail)
            }
        }

        return {
            ...obj,
            [head]: setValue
        }
    }

    return step(obj, path)
}
