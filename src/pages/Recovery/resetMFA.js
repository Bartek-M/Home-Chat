import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { apiSend } from "../../utils"
import { useFlash } from "../../context"

export function ResetMFA() {
    const [verified, setVerified] = useState(null)
    const [searchParams,] = useSearchParams()
    const setFlash = useFlash()

    useEffect(() => {
        if (verified !== null) return

        const ticket = searchParams.get("ticket")
        if (!ticket) { setVerified(false); return setFlash("Invalid ticket", "error") }

        apiSend({}, "resetMFA", {
            ticket: ticket
        }, "POST").then(res => {
            if (["401 Unauthorized", "403 Forbidden"].includes(res.message)) return setFlash("Invalid ticket", "error")

            if (res.message === "200 OK") {
                setVerified(true)
                return setFlash("Verified")
            }

            if (res.message) return setFlash(res.message, "error")
            setFlash("Something went wrong!", "error")
        }).then(() => setVerified(current_verified => {if (!current_verified) return false; return current_verified} ))
    }, [])

    return (
        <div className="login-page center-container">
            <div className="settings-edit-card column-container">
                <h3>Two-Factor authentication</h3>
                {verified === null && <div className="center-container"><div className="loading-dots"></div></div>}
                {verified === false && <div className="justified-wrapper">Couldn't remove 2FA from your account - ticket might be invalid or expired.</div>}
                {verified && <div className="justified-wrapper">Removed 2FA from your account. Using 2FA secures your account and is recommended for all users, so you might think about bringing it back.</div>}
                <a className="link" href="/login">Login</a>
            </div>
        </div>
    )
}