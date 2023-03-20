import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import Loading from "../components/loading"

export default function Logout() {
    const navigator = useNavigate()

    useEffect(() => {
        localStorage.clear()
        navigator("/login")
    })

    return (<Loading />)
}