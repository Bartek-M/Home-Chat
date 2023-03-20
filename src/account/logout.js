import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import Loading from "../components/loading"

export default function Logout() {
    const navigator = useNavigate()

    useEffect(() => {
        localStorage.removeItem("token")
        navigator("/login")
    })

    return (<Loading />)
}