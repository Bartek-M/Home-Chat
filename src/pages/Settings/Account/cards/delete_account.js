import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useFlash, useUser } from "../../../../context"
import { MFA } from "../../../../components"
import { apiSend } from "../../../../utils"

// Functions
function submit_delete({ button, navigator, user, password, setPage, code, setFlash }) {
    if (!password || (code && !code.value)) return

    apiSend(button, "user_delete", {
        password: password,
        code: code ? code.value : null
    }, "DELETE", "@me").then(res => {
        if (res.errors) {
            if (!code && user.mfa_enabled && !res.errors.password) { return setPage("mfa") }
            if (!code && res.errors.password) return document.getElementById("password-error").innerText = `- ${res.errors.password}`
            if (code && res.errors.code) return document.getElementById("code-error").innerText = `- ${res.errors.code}`
        }

        if (res.message == "200 OK") {
            localStorage.clear()
            navigator("/login")
            return setFlash("Removed your account!")
        }

        setFlash("Something went wrong!", "error")
    })
}

export function DeleteAccount({ props }) {
    const { close } = props

    const [user,] = useUser()
    const setFlash = useFlash()

    const navigator = useNavigate()
    const password = useRef()

    const [page, setPage] = useState(null)
    if (page) return <MFA title="Delete Account" submit_text="Delete Account" warning={true} submit_function={submit_delete} password={password.current.value} setPage={setPage} close={close} />

    return (
        <form className="settings-edit-card center-column-container">
            <div className="column-container">
                <h3>Delete Account</h3>
                <div className="warning-wrapper">Are you sure that you want to delete your account? This will immediately log out of your account and you will not be able to log in again.</div>
            </div>
            <div className="column-container">
                <p className="category-text">PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                <input className="input-field small-card-field" autoFocus type="password" ref={password} maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" onClick={(e) => {
                    e.preventDefault()
                    submit_delete({ button: e.target, navigator: navigator, user: user, password: password.current.value, setPage: setPage, setFlash: setFlash })
                }} value={user.mfa_enabled ? "Continue" : "Delete Account"}
                />
            </div>
        </form>
    )
}