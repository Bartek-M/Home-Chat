import { useRef } from "react"
import { useNavigate } from "react-router-dom"

import { apiSend } from "../../utils"
import { useFlash } from "../../context"

function submit(button, navigator, email, username, password, setFlash) {
    if (!email.value || !username.value || !password.value) return

    apiSend(button, "authRegister", {
        email: email.value,
        username: username.value,
        password: password.value
    }, "POST").then(res => {
        if (res.errors) {
            document.getElementById("email-error").innerText = res.errors.email ? `- ${res.errors.email}` : "*"
            document.getElementById("username-error").innerText = res.errors.username ? `- ${res.errors.username}` : "*"
            document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : "*"

            return
        }

        if (res.message === "200 OK") {
            localStorage.setItem("user_login", email.value)
            return navigator("/login")
        }
        
        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function Register() {
    const setFlash = useFlash()
    const navigator = useNavigate()

    const email = useRef()
    const username = useRef()
    const password = useRef()

    return (
        <div className="login-page center-container">
            <div className="login-window">
                <h1 className="login-title">Create an account</h1>

                <form>
                    <div className="column-container">
                        <p className="category-text">EMAIL <span className="error-category-text" id="email-error">*</span></p>
                        <input className="input-field" autoFocus type="email" ref={email} size="30" required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">USERNAME <span className="error-category-text" id="username-error">*</span></p>
                        <input className="input-field" ref={username} size="30" required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                        <input className="input-field" type="password" ref={password} size="30" required />
                    </div>

                    <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(), submit(e.target, navigator, email.current, username.current, password.current, setFlash) }} value="CONTINUE" />
                    <p className="login-redirect">Already have an account? <a className="link" href="login">Log In</a></p>
                </form>
            </div>
        </div>
    )
}