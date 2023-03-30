import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { api_send } from "../../api";
import { flash_message } from "../../functions";

// Functions
function submit_delete(navigator, user, password, setPage, code) {
    if (!password || (code && !code.value)) return

    api_send("user_delete", {
        password: password,
        code: code ? code.value : null
    }, "@me").then(res => {
        if (res.errors) {
            if (!code && user.mfa_enabled && !res.errors.password) { return setPage("mfa") }
            if (!code && res.errors.password) return document.getElementById("password-error").innerText = `- ${res.errors.password}`
            if (code && res.errors.code) return document.getElementById("code-error").innerText = `- ${res.errors.code}`
        }

        if (res.message == "200 OK") {
            localStorage.clear()
            navigator("/login")
            return flash_message("Removed your account!")
        }

        flash_message("Something went wrong!", "error")
    })
}

export default function DeleteAccount({ props }) {
    const { user, close } = props

    const [page, setPage] = useState(null)
    const navigator = useNavigate()

    const password = useRef()
    const code = useRef()

    if (page) {
        return (
            <form className="settings-edit-card center-column-container">
                <div className="column-container">
                    <h3>Delete Account</h3>
                </div>
                <div className="column-container">
                    <p className="category-text">HOME CHAT AUTH CODE <span className="error-category-text" id="code-error" key="code-error">*</span></p>
                    <input className="input-field small-card-field" ref={code} key="mfa-inpt" maxLength={10} required />
                </div>
                <div className="card-submit-wrapper">
                    <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                    <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); submit_delete(user, password.current.value, setPage, code.current) }} value="Delete Account" />
                </div>
            </form>
        )
    }

    return (
        <form className="settings-edit-card center-column-container">
            <div className="column-container">
                <h3>Delete Account</h3>
                <div className="warning-wrapper">Are you sure that you want to delete your account? This will immediately log out of your account and you will not be able to log in again.</div>
            </div>
            <div className="column-container">
                <p className="category-text">PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                <input className="input-field small-card-field" type="password" ref={password} maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); submit_delete(navigator, user, password.current.value, setPage) }} value={user.mfa_enabled ? "Continue" : "Delete Account"} />
            </div>
        </form>
    )
}