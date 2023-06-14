import { useRef, useState } from "react";

import { useFlash, useUser } from "../../../../context";
import { MFA } from "../../../../components"
import { apiSend, genSecret } from "../../../../utils";

const qrcodes = require("qrcode")

// Functions
function enable_mfa(button, setUser, password, setPage, close, code, secret, setFlash) {
    if (!password || (code && !code.value)) return

    apiSend(button, "userMFA", {
        code: code ? code.value : null,
        password: password,
        secret: secret,
        option: "enable"
    }, "PATCH", "@me").then(res => {
        if (res.message === "429 Too Many Requests") return setFlash("Too many requests", "error")

        if (res.errors) {
            if (!code) {
                if (!res.errors.password) return setPage("mfa-page")
                if (res.errors.password) return document.getElementById("password-error").innerText = `- ${res.errors.password}`
            }
            return document.getElementById("code-error").innerText = res.errors.code ? `- ${res.errors.code}` : "*"
        }

        if (res.message === "200 OK") {
            setUser((current_user) => { return { ...current_user, "mfa_enabled": 1 } })
            setFlash("MFA Enabled!")
            return close()
        }

        return setFlash("Something went wrong!", "error")
    })
}

function disable_mfa({ button, setUser, code, close, setFlash }) {
    if (!code.value) return

    apiSend(button, "userMFA", {
        code: code.value,
        option: "disable"
    }, "PATCH", "@me").then(res => {
        if (res.message === "429 Too Many Requests") return setFlash("Too many requests", "error")
        if (res.errors) return document.getElementById("code-error").innerText = res.errors.code ? `- ${res.errors.code}` : "*"

        if (res.message === "200 OK") {
            setUser((current_user) => { return { ...current_user, "mfa_enabled": 0 } })
            setFlash("MFA Disabled!")
            return close()
        }

        return setFlash("Something went wrong!", "error")
    })
}

// Render
export function MFASetup({ props }) {
    const { close } = props

    const [user, setUser] = useUser()
    const setFlash = useFlash()

    const [page, setPage] = useState(null)

    const password = useRef()
    const code = useRef()

    // Disable MFA
    if (user.mfa_enabled) return <MFA title="Disable Two-Factor Authentication" submit_text="Remove 2FA" submit_function={disable_mfa} close={close} />

    // Setup MFA
    if (page) {
        const generated = genSecret()
        const passw = password.current.value

        const secret = generated[0]
        const formated_code = generated[1]

        var qr_code = ""
        const url = `otpauth://totp/${encodeURIComponent(user.email)}?secret=${secret}&issuer=Home%20Chat`
        qrcodes.toDataURL(url, (e, data_url) => { qr_code = data_url })

        return (
            <form className="settings-edit-card center-column-container">
                <div className="column-container">
                    <h3>Enable Two-Factor Auth</h3>
                    <p className="category-text">Make your account safer in 3 easy steps:</p>
                    <button className="card-close center-container" type="button" onClick={() => close()}>
                        <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                            <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                        </svg>
                    </button>
                </div>
                <div className="spaced-container">
                    <img style={{ width: "100px", height: "100px", margin: "0 1rem" }} src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Google_Authenticator_for_Android_icon.svg/1200px-Google_Authenticator_for_Android_icon.svg.png" />
                    <div className="column-container">
                        <h3 className="card-header-text">Download an authenticator app</h3>
                        <p className="category-text">Download and install <a className="link" href="https://support.google.com/accounts/answer/1066447?hl=en" target="_blank">Google Authenticator</a> for your phone or tablet.</p>
                    </div>
                </div>
                <hr className="separator" />
                <div className="spaced-container">
                    <img style={{ width: "116px", height: "116px", margin: "0 .5rem" }} src={qr_code} />
                    <div className="spaced-column-container">
                        <div className="column-container">
                            <h3 className="card-header-text">Scan the qr code</h3>
                            <p className="category-text">Open the authenticator app and scan the image to the left using your phone's camera.</p>
                        </div>
                        <div className="column-container">
                            <h3 className="card-header-text">2FA key (manual entry)</h3>
                            <p className="category-text">{formated_code}</p>
                        </div>
                    </div>
                </div>
                <hr className="separator" />
                <div className="spaced-container">
                    <svg style={{ margin: "0 2rem" }} width="100" height="100" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                        <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z" />
                        <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                    </svg>
                    <div className="column-container">
                        <h3 className="card-header-text">Log in with your code <span className="error-category-text" id="code-error" key="code-error">*</span></h3>
                        <p className="category-text">Enter the 6-digit verification code generated.</p>
                        <div className="container">
                            <input className="input-field small-card-field" autoFocus ref={code} key="mfa-inpt" maxLength={10} required />
                            <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); enable_mfa(e.target, setUser, passw, setPage, close, code.current, secret, setFlash) }} value="Activate" />
                        </div>
                    </div>
                </div>
            </form>
        )
    }

    // Enable MFA
    return (
        <form className="settings-edit-card center-column-container">
            <div className="column-container">
                <h3>Enable Two-Factor Authentication</h3>
            </div>
            <div className="column-container">
                <p className="category-text">PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                <input className="input-field small-card-field" autoFocus type="password" ref={password} maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); enable_mfa(e.target, setUser, password.current.value, setPage, close, setFlash) }} value="Continue" />
            </div>
        </form>
    )
}