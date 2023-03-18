import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { api_send } from "../api"

function submit(navigator, email, password) {
    api_send("auth_login", {
        email: email.value,
        password: password.value
    }).then(res => {
        if (res.errors) {
            document.getElementById("email-error").innerText = res.errors.email ? `- ${res.errors.email}` : null
            document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : null

            return
        }

        if (res.message === "200 OK") {
            // Store token
            console.log(res.token)
            navigator("/")
        }
    })
}

export default function Login() {
    const navigator = useNavigate()

    const email = useRef()
    const password = useRef()

    return (
        <div className="login-page center-container">
            <div className="login-window">
                <h1 className="login-title">Welcome back!</h1>

                <form>
                    <div className="column-container">
                        <p className="category-text">EMAIL <span className="error-category-text" id="email-error"></span></p>
                        <input className="input-field" type="email" ref={email} maxLength={100} required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">PASSWORD <span className="error-category-text" id="password-error"></span></p>
                        <input className="input-field" type="password" ref={password} maxLength={50} required />
                    </div>
                    <p className="login-redirect"><a className="link" href="password-recovery">Forgot your password?</a></p>

                    <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); submit(navigator, email.current, password.current) }} value="LOG IN" />
                    <p className="login-redirect">Need an account? <a className="link" href="register">Register</a></p>
                </form>
            </div>
        </div>
    )
}