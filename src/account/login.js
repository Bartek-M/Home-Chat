import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { api_send } from "../api"
import { flash_message } from "../functions"

function submit(navigator, setCodePage, email, password) {
    if (!email || !password) return

    api_send("auth_login", {
        email: email.value,
        password: password.value
    }).then(res => {
        // Some errors about email or password
        if (res.errors) {
            document.getElementById("email-error").innerText = res.errors.email ? `- ${res.errors.email}` : "*"
            document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : "*"
            return
        }

        if (res.message === "200 OK") {
            // MFA disabled + VERIFIED user + TOKEN recived
            if (!res.mfa && res.verified && res.token) {
                localStorage.setItem("token", res.token)
                navigator("/")
                return flash_message("Logged in!")
            }

            // MFA disabled + NON VERIFIED user + TICKET recived with no TOKEN
            if (!res.mfa && !res.verified && res.ticket) {
                email.value = ""
                localStorage.setItem("ticket", res.ticket)
                return setCodePage("verify")
            }

            // MFA enabled + VERIFIED user + TICKET recived with no TOKEN
            if (res.mfa && res.verified && res.ticket) {
                email.value = ""
                localStorage.setItem("ticket", res.ticket)
                return setCodePage("mfa")
            }
        }

        // Something went wrong
        return flash_message("Something went wrong!", "error")
    })
}

function verify(navigator, auth_code) {
    if (!auth_code) return

    api_send("auth_verify", {
        code: auth_code.value,
        ticket: localStorage.getItem("ticket"),
    }).then(res => {
        console.log(res)
        // Code errors
        if (res.errors) return document.getElementById("code-error").innerText = res.errors.code ? `- ${res.errors.code}` : "*"

        if (res.message === "200 OK") {
            // MFA disabled + VERIFIED user + TOKEN recived
            if (!res.mfa + res.verified + res.token) {
                localStorage.removeItem("ticket")
                localStorage.setItem("token", res.token)
                navigator("/")
                return flash_message("Logged in!")
            }

            // MFA enabled + VERIFIED user + TICKET recived
            if (res.mfa + res.verified + res.token) {
                auth_code.value = ""
                localStorage.setItem("ticket", res.ticket)
                return setCodePage("mfa")
            }
        }

        // Something went wrong
        navigator("/login")
        return flash_message("Login again!", "error")
    })
}

export default function Login() {
    const [codePage, setCodePage] = useState(null)
    const navigator = useNavigate()

    const email = useRef()
    const password = useRef()
    const auth_code = useRef()

    const user_email = localStorage.getItem("email")

    // Render mfa verify page
    if (codePage === "mfa") {
        return (
            <div className="login-page center-container">
                <div className="auth-window">
                    <h1 className="login-title">Two-factor authentication</h1>

                    <form autoComplete="off">
                        <div className="column-container">
                            <p className="category-text">ENTER HOME CHAT AUTH CODE <span className="error-category-text" id="code-error">*</span></p>
                            <input className="input-field" type="text" ref={auth_code} maxLength={10} required />
                        </div>
                        <p className="login-redirect"><a className="link" href="recovery/mfa">Don't have any access to auth codes?</a></p>

                        <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); verify(navigator, auth_code.current) }} value="LOG IN" />
                        <p className="login-redirect"><a className="link" href="login">Go Back to Login</a></p>
                    </form>
                </div>
            </div>
        )
    }

    // Render account verify page
    if (codePage === "verify") {
        return (
            <div className="login-page center-container">
                <div className="auth-window">
                    <h1 className="login-title">Email verification</h1>

                    <form autoComplete="off">
                        <div className="column-container">
                            <p className="category-text">ENTER CODE FROM YOUR EMAIL <span className="error-category-text" id="code-error">*</span></p>
                            <input className="input-field" type="text" ref={auth_code} maxLength={10} required />
                        </div>

                        <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); verify(navigator, auth_code.current) }} value="LOG IN" />
                        <p className="login-redirect"><a className="link" href="login">Go Back to Login</a></p>
                    </form>
                </div>
            </div>
        )
    }

    // Render login Page
    return (
        <div className="login-page center-container">
            <div className="login-window">
                <h1 className="login-title">Welcome back!</h1>

                <form>
                    <div className="column-container">
                        <p className="category-text">EMAIL <span className="error-category-text" id="email-error">*</span></p>
                        <input className="input-field" type="email" defaultValue={user_email} ref={email} maxLength={100} required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                        <input className="input-field" type="password" ref={password} maxLength={50} required />
                    </div>
                    <p className="login-redirect"><a className="link" href="recovery/password">Forgot your password?</a></p>

                    <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); submit(navigator, setCodePage, email.current, password.current) }} value="LOG IN" />
                    <p className="login-redirect">Need an account? <a className="link" href="register">Register</a></p>
                </form>
            </div>
        </div>
    )
}