import { useState, useRef } from "react"
import { api_send, flash_message } from "../../../../utils";

// Function
function update_password(user, password, new_password, confirm_password, close, setPage, code) {
    if (!password.value || !new_password.value || !confirm_password.value || (code && !code.value)) return

    if (!code) {
        if (new_password.value !== confirm_password.value) return document.getElementById("conf-passw-error").innerText = "Passwords don't match!"
        document.getElementById("conf-passw-error").innerText = "*"

        if (new_password.value.lenght < 6) return document.getElementById("new-passw-error").innerText = "Must be 6 or more in length"
        document.getElementById("new-passw-error").innerText = "*"
    }

    api_send("user", {
        category: "password",
        data: new_password.value,
        password: password.value,
        code: code ? code.value : null
    }, "@me").then(res => {
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
    const { user, close } = props
    const [page, setPage] = useState(null)

    const password = useRef()
    const new_password = useRef()
    const confirm_password = useRef()

    const code = useRef()

    if (page) {
        const passw = password.current
        const new_passw = new_password.current
        const confirm_passw = confirm_password.current

        return (
            <form className="settings-edit-card center-column-container">
                <div className="column-container">
                    <h3>Update your password</h3>
                </div>
                <div className="column-container">
                    <p className="category-text">HOME CHAT AUTH CODE <span className="error-category-text" id="code-error" key="code-error">*</span></p>
                    <input className="input-field small-card-field" ref={code} key="mfa-inpt" maxLength={10} required />
                </div>
                <div className="card-submit-wrapper">
                    <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                    <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); update_password(user, passw, new_passw, confirm_passw, close, setPage, code.current) }} value="Update Password" />
                </div>
            </form>
        )
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
                <input className="input-field" type="password" ref={password} maxLength={50} required />

                <p className="category-text">NEW PASSWORD <span className="error-category-text" id="new-passw-error">*</span></p>
                <input className="input-field" type="password" ref={new_password} maxLength={50} required />

                <p className="category-text">CONFIRM NEW PASSWORD <span className="error-category-text" id="conf-passw-error">*</span></p>
                <input className="input-field" type="password" ref={confirm_password} maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); update_password(user, password.current, new_password.current, confirm_password.current, close, setPage) }} value={user.mfa_enabled ? "Continue" : "Update Password"} />
            </div>
        </form>
    )
}