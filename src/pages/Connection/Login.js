import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useFlash } from "../../context"
import { apiSend } from "../../utils"

function submit(button, navigator, setCodePage, login, password, setFlash) {
    if (!login.value || !password.value) return

    apiSend(button, "authLogin", {
        login: login.value,
        password: password.value
    }, "POST").then(res => {
        if (res.errors) {
            document.getElementById("login-error").innerText = res.errors.login ? `- ${res.errors.login}` : "*"
            document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : "*"
            return
        }

        if (res.message === "200 OK") {
            // MFA disabled + VERIFIED user + TOKEN received
            if (!res.mfa && res.verified && res.token) {
                localStorage.setItem("token", res.token)
                navigator("/")
                return setFlash("Logged in!")
            }

            // MFA disabled + NON VERIFIED user + TICKET received with no TOKEN
            if (!res.mfa && !res.verified && res.ticket) {
                localStorage.setItem("ticket", res.ticket)
                return setCodePage("verify")
            }

            // MFA enabled + VERIFIED user + TICKET received with no TOKEN
            if (res.mfa && res.verified && res.ticket) {
                localStorage.setItem("ticket", res.ticket)
                return setCodePage("mfa")
            }
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

function verify(button, navigator, auth_code, setFlash) {
    if (!auth_code) return

    apiSend(button, "authVerify", {
        code: auth_code.value,
        ticket: localStorage.getItem("ticket"),
    }, "POST").then(res => {
        if (res.errors) return document.getElementById("code-error").innerText = res.errors.code ? `- ${res.errors.code}` : "*"

        if (res.message === "200 OK") {
            // MFA disabled + VERIFIED user + TOKEN received
            if (!res.mfa + res.verified + res.token) {
                localStorage.removeItem("ticket")
                localStorage.setItem("token", res.token)
                navigator("/")
                return setFlash("Logged in!")
            }

            // MFA enabled + VERIFIED user + TICKET received
            if (res.mfa + res.verified + res.token) {
                localStorage.setItem("ticket", res.ticket)
                return setCodePage("mfa")
            }
        }

        navigator("/login")
        setFlash("Login again!", "error")
    })
}

export function Login() {
    const [codePage, setCodePage] = useState(null)
    const setFlash = useFlash()

    const navigator = useNavigate()

    const login = useRef()
    const password = useRef()
    const auth_code = useRef()

    const user_login = localStorage.getItem("user_login")

    // Render mfa verify page
    if (codePage === "mfa") {
        return (
            <div className="login-page center-container">
                <div className="auth-window">
                    <h1 className="login-title">Two-factor authentication</h1>

                    <form>
                        <div className="column-container">
                            <p className="category-text">HOME CHAT AUTH CODE <span className="error-category-text" id="code-error" key="code-error">*</span></p>
                            <input className="input-field" autoFocus type="text" ref={auth_code} placeholder="6-digit authentication code" key="mfa-inpt" maxLength={10} required />
                        </div>
                        <p className="login-redirect"><a className="link" href="recovery/mfa">Don't have any access to auth codes?</a></p>

                        <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); verify(e.target, navigator, auth_code.current, setFlash) }} value="LOG IN" />
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

                    <form>
                        <div className="column-container">
                            <p className="category-text">CODE FROM YOUR EMAIL <span className="error-category-text" id="code-error" key="code-error">*</span></p>
                            <input className="input-field" autoFocus type="text" ref={auth_code} key="verify-inpt" maxLength={10} required />
                        </div>

                        <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); verify(e.target, navigator, auth_code.current, setFlash) }} value="LOG IN" />
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
                        <p className="category-text">EMAIL OR USERNAME <span className="error-category-text" id="login-error">*</span></p>
                        <input className="input-field" autoFocus type="text" defaultValue={user_login} ref={login} maxLength={100} required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                        <input className="input-field" type="password" ref={password} maxLength={50} required />
                    </div>
                    <p className="login-redirect"><a className="link" href="recovery/password">Forgot your password?</a></p>

                    <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); submit(e.target, navigator, setCodePage, login.current, password.current, setFlash) }} value="LOG IN" />
                    <p className="login-redirect">Need an account? <a className="link" href="register">Register</a></p>
                </form>
            </div>
        </div>
    )
}