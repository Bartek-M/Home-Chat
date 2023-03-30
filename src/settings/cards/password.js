import { useState, useRef } from "react"

import { api_send } from "../../api"
import { flash_message } from "../../functions"

// Function
function update_password(password, new_password, confirm_password, close, code) {
    if (!password || !new_password || !confirm_password || (code && !code.value)) return

}

export default function Password({ props }) {
    const { user, close } = props
    const [page, setPage] = useState(null)

    const password = useRef()
    const new_password = useRef()
    const confirm_password = useRef()

    const code = useRef()

    if (page) {
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
                    <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); update_password() }} value="Update Password" />
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
                <p className="category-text">CURRENT PASSWORD</p>
                <input className="input-field" type="password" ref={password} maxLength={50} required />

                <p className="category-text">NEW PASSWORD</p>
                <input className="input-field" type="password" ref={new_password} maxLength={50} required />

                <p className="category-text">CONFIRM NEW PASSWORD</p>
                <input className="input-field" type="password" ref={confirm_password} maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" value={user.mfa_enabled ? "Continue" : "Update Password"} />
            </div>
        </form>
    )
}