import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { api_send } from "../api"

function submit(navigator, email, username, password) {
    api_send("auth_register", {
        email: email.value,
        username: username.value,
        password: password.value
    }).then(res => {
        if (res.errors) {
            document.getElementById("email-error").innerText = res.errors.email ? `- ${res.errors.email}` : null
            document.getElementById("username-error").innerText = res.errors.username ? `- ${res.errors.username}` : null
            document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : null

            return
        }

        if (res.message === "200 OK") {
            navigator("/login")
        }
    })
}

export default function Register() {
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
                        <p className="category-text">EMAIL <span className="error-category-text" id="email-error"></span></p>
                        <input className="input-field" type="email" ref={email} size="30" required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">USERNAME <span className="error-category-text" id="username-error"></span></p>
                        <input className="input-field" ref={username} size="30" required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">PASSWORD <span className="error-category-text" id="password-error"></span></p>
                        <input className="input-field" type="password" ref={password} size="30" required />
                    </div>

                    <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(), submit(navigator, email.current, username.current, password.current) }} value="CONTINUE" />
                    <p className="login-redirect">Already have an account? <a className="link" href="login">Log In</a></p>
                </form>
            </div>
        </div>
    )
}