import { useRef, useState } from "react";
import { api_send } from "../../api";
import { flash_message } from "../../functions";

const speakeasy = require("speakeasy")
const qrcodes = require("qrcode")

// Functions
function next_page(setPassw, password) {
    api_send("user_mfa", {
        password: password.value,
        option: "enable"
    }, "@me").then(res => {
        if (res.errors && !res.errors.password) return setPassw(password.value)
        if (res.errors && res.errors.password) return document.getElementById("password-error").innerText = `- ${res.errors.password}`
    })
}

function submit_mfa(user, setUser, code, secret, password, close) {
    api_send("user_mfa", {
        code: code.value,
        password: password,
        secret: secret,
        option: "enable"
    }, "@me").then(res => {
        if (res.errors) return document.getElementById("code-error").innerText = res.errors.code ? `- ${res.errors.code}` : "*"

        if (res.message === "200 OK") {
            setUser({ ...user, "mfa_enabled": 1 })
            flash_message("MFA Enabled!")
            return close()
        }

        return flash_message("Something went wrong!", "error")
    })
}

// Render
export default function MFA({ props }) {
    const { user, setUser, close } = props
    const [passw, setPassw] = useState(null)

    const password = useRef()
    const code = useRef()

    if (passw) {
        const secret = speakeasy.generateSecret({ length: 10, name: user.email, issuer: "Home Chat" })

        var secret_code = ""
        var qr_code = ""

        secret.otpauth_url = `${secret.otpauth_url}&issuer=Home%20Chat`
        qrcodes.toDataURL(secret.otpauth_url, (e, data_url) => { qr_code = data_url })
        for (let i = 0; i < secret.base32.length; i++) { if (i % 4 === 0 && i != 0) { secret_code += "-" }; secret_code += secret.base32[i] }

        return (
            <>
                <div className="column-container">
                    <h3>Enable Two-Factor Auth</h3>
                    <p className="category-text">Make your account safer in 3 easy steps:</p>
                    <button className="card-close center-container" onClick={close}>
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
                            <p className="category-text">{secret_code}</p>
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
                        <h3 className="card-header-text">Log in with your code <span className="error-category-text" id="code-error">*</span></h3>
                        <p className="category-text">Enter the 6-digit verification code generated.</p>
                        <div className="container">
                            <input className="input-field small-card-field" ref={code} maxLength={10} required />
                            <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); submit_mfa(user, setUser, code.current, secret.base32, passw, close) }} value="Activate" />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="column-container">
                <h3>Enable Two-Factor Auth</h3>
            </div>
            <div className="column-container">
                <p className="category-text">PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                <input className="input-field small-card-field" type="password" ref={password} maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" onClick={close}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); next_page(setPassw, password.current) }} value="Continue" />
            </div>
        </>
    )
}