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

function resendEmail(button, navigator, setFlash) {
    apiSend(button, "resendVerification", {
        ticket: localStorage.getItem("ticket")
    }, "POST").then(res => {
        if (res.errors) return document.getElementById("code-error").innerText = res.errors.resend ? `- ${res.errors.resend}` : "*"
        if (["401 Unauthorized", "403 Forbidden"].includes(res.message)) return setFlash("Invalid ticket", "error")

        if (res.message === "200 OK" && res.token) {
            localStorage.removeItem("ticket")
            localStorage.setItem("token", res.token)
            navigator("/")
            return setFlash("Logged in!")
        }

        if (res.message === "200 OK") return setFlash("Resent verification")

        navigator("/login")
        setFlash("Login again!", "error")
    })
}

function forgotPassword(button, userLogin, setFlash) {
    if (!userLogin.value) return document.getElementById("login-error").innerText = "- Enter email or username"

    apiSend(button, "forgotPassw", {
        login: userLogin.value
    }, "POST").then(res => {
        if (res.errors) {
            if (res.errors.login) return document.getElementById("login-error").innerText = `- ${res.errors.login}`
            if (res.errors.resend) return document.getElementById("login-error").innerText = `- ${res.errors.resend}`
        }

        document.getElementById("login-error").innerText = "*"
        if (res.message === "200 OK") return setFlash("Sent password recovery to your email")

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

function noMFAAccess(button, setFlash) {
    apiSend(button, "noMFAAccess", {
        ticket: localStorage.getItem("ticket")
    }, "POST").then(res => {
        if (res.errors) { 
            if (res.errors.mfa) return document.getElementById("code-error").innerText = `- ${res.errors.mfa}`
            if (res.errors.resend) return document.getElementById("code-error").innerText = `- ${res.errors.resend}`
        }
        if (["401 Unauthorized", "403 Forbidden"].includes(res.message)) return setFlash("Invalid ticket", "error")

        document.getElementById("code-error").innerText = "*"
        if (res.message === "200 OK") return setFlash("Sent 2FA reset to your email")

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function Login() {
    const [codePage, setCodePage] = useState(null)
    const setFlash = useFlash()

    const navigator = useNavigate()

    const login = useRef()
    const password = useRef()
    const auth_code = useRef()

    const userLogin = localStorage.getItem("userLogin")

    // Render mfa verify page
    if (codePage === "mfa") {
        return (
            <div className="login-page center-container">
                <div className="auth-window">
                    <h1 className="login-title">Two-Factor authentication</h1>

                    <form>
                        <div className="column-container">
                            <p className="category-text">HOME CHAT AUTH CODE <span className="error-category-text" id="code-error" key="code-error">*</span></p>
                            <input className="input-field" autoFocus type="text" ref={auth_code} placeholder="6-digit authentication code" key="mfa-inpt" maxLength={10} required />
                        </div>
                        <p className="login-redirect"><button className="link" type="button" onClick={(e) => noMFAAccess(e.target, setFlash)}>Don't have access to your auth codes?</button></p>

                        <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); verify(e.target, navigator, auth_code.current, setFlash) }} value="LOG IN" />
                        <p className="login-redirect"><a className="link" href="/login">Go Back to Login</a></p>
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
                        <p className="login-redirect"><button className="link" type="button" onClick={(e) => resendEmail(e.target, navigator, setFlash)}>Resend Email</button></p>

                        <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); verify(e.target, navigator, auth_code.current, setFlash) }} value="LOG IN" />
                        <p className="login-redirect"><a className="link" href="/login">Go Back to Login</a></p>
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
                        <input className="input-field" autoFocus type="text" defaultValue={userLogin} ref={login} maxLength={100} required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                        <input className="input-field" type="password" ref={password} maxLength={50} required />
                    </div>
                    <p className="login-redirect"><button className="link" type="button" onClick={(e) => forgotPassword(e.target, login.current, setFlash)}>Forgot your password?</button></p>

                    <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); submit(e.target, navigator, setCodePage, login.current, password.current, setFlash) }} value="LOG IN" />
                    <p className="login-redirect">Need an account? <a className="link" href="/register">Register</a></p>
                </form>
            </div>
        </div>
    )
}