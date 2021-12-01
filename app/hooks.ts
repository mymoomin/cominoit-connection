import { useCallback, useState } from "react"


export function useToggle(bool: boolean): [boolean, () => void] {
    const [state, setState] = useState(bool)
    const toggle = () => setState(state => !state)
    return [state, toggle]
}