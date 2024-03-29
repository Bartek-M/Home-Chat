import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { Loading } from "../../components"

export function Logout() {
    const navigator = useNavigate()

    useEffect(() => {
        localStorage.clear()
        document.documentElement.setAttribute("data-theme", "dark")
        navigator("/login")
    })

    return (<Loading />)
}