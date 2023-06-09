import { useState, useRef } from "react"

import { useUser } from "../../../../context";
import { MFA } from "../../../../components"
import { api_send, flash_message } from "../../../../utils";
 
// Function
function update_password({user, password, data, close, setPage, code}) {
    if (data.length !== 2) return
    if (!data[0] || !data[1]) return

    var new_passw = data[0]
    var confirm_passw = data[1]
    if (!password.value || !new_passw.value || !confirm_passw.value || (code && !code.value)) return

    if (!code) {
        if (new_passw.value !== confirm_passw.value) return document.getElementById("conf-passw-error").innerText = "Passwords don't match!"
        document.getElementById("conf-passw-error").innerText = "*"

        if (new_passw.value.length < 6) return document.getElementById("new-passw-error").innerText = "Must be 6 or more in length"
        document.getElementById("new-passw-error").innerText = "*"
    }

    api_send("user", {
        category: "password",
        data: new_passw.value,
        password: password.value,
        code: code ? code.value : null
    }, "PATCH", "@me").then(res => {
        if (res.errors) {
            if (!code && user.mfa_enabled && !res.errors.password && !res.errors.new_password) { return setPage("mfa") }
            if (!code && (!res.errors.password || !res.errors.new_password)) {
                document.getElementById("curr-passw-error").innerText = res.errors.password ? `- ${res.errors.password}` : "*"
                document.getElementById("new-passw-error").innerText = res.errors.new_password ? `- ${res.errors.new_password}` : "*"
                return
            }

            if (code && res.errors.code) return document.getElementById("code-error").innerText = `- ${res.errors.code}`
        }

        if (res.message === "200 OK") {
            close()
            return flash_message("Password updated!")
        }

        flash_message("Something went wrong!", "error")
    })
}

export function Password({ props }) {
    const { close } = props

    const [user, ] = useUser()
    const [page, setPage] = useState(null)

    const password = useRef()
    const new_password = useRef()
    const confirm_password = useRef()

    if (page) {
        const passw = password.current
        const new_passw = new_password.current
        const confirm_passw = confirm_password.current

        return <MFA title="Update your password" submit_text="Update Password" submit_function={update_password} setPage={setPage} password={passw} data={[new_passw, confirm_passw]} close={close} />
    }

    return (
        <form className="settings-edit-card center-column-container">
            <div className="card-title-wrapper center-column-container">
                <h2>Update your password</h2>
                <p className="edit-card-info">Enter your current password and a new password.</p>
                <button className="card-close center-container" type="button" onClick={() => close()}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <div className="column-container">
                <p className="category-text">CURRENT PASSWORD <span className="error-category-text" id="curr-passw-error">*</span></p>
                <input className="input-field" autoFocus type="password" ref={password} maxLength={50} required />

                <p className="category-text">NEW PASSWORD <span className="error-category-text" id="new-passw-error">*</span></p>
                <input className="input-field" type="password" ref={new_password} maxLength={50} required />

                <p className="category-text">CONFIRM NEW PASSWORD <span className="error-category-text" id="conf-passw-error">*</span></p>
                <input className="input-field" type="password" ref={confirm_password} maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                    <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); update_password({ user: user, password: password.current, data: [new_password.current, confirm_password.current], setPage: setPage, close: close}) }} value={user.mfa_enabled ? "Continue" : "Update Password"} />
            </div>
        </form>
    )
}