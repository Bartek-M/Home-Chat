import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { apiSend } from "../../utils"
import { useFlash } from "../../context"

export function EmailConfirm() {
    const [verified, setVerified] = useState(null)
    const [searchParams,] = useSearchParams()
    const setFlash = useFlash()

    useEffect(() => {
        if (verified !== null) return

        const ticket = searchParams.get("ticket")
        if (!ticket) {setVerified(false); return setFlash("Invalid ticket", "error")}
        
        apiSend({}, "confirmEmail", {
            ticket: ticket
        }, "POST").then(res => {
            if (res.errors && res.errors.email) return setFlash(res.errors.email, "error")
            if (["401 Unauthorized", "403 Forbidden"].includes(res.message)) return setFlash("Invalid ticket", "error")

            if (res.message === "200 OK" && res.email) {
                setVerified(res.email)
                return setFlash("Verified")
            }

            if (res.message) return setFlash(res.message, "error")
            setFlash("Something went wrong!", "error")
        }).then(() => setVerified(current_verified => {if (!current_verified) return false; return current_verified} ))
    }, [])

    return (
        <div className="login-page center-container">
            <div className="settings-edit-card column-container">
                <h3>Confirm New Email</h3>
                {verified === null && <div className="center-container"><div className="loading-dots"></div></div>}
                {verified === false && <div className="justified-wrapper">Couldn't update your email - ticket might be invalid or expired. Remember, that you can also login with your username and change your email again.</div>}
                <div className="justified-wrapper">Updated your email address to '{verified}'.</div>
                <a className="link" href="/login">Login</a>
            </div>
        </div>
    )
}