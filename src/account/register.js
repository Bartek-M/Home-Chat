import { useRef } from "react"
import { api_send } from "../api"

function submit(email, username, password) {
    api_send("auth_register", {
        email: email.value,
        username: username.value,
        password: password.value
    }).then(res => console.log(res))
}

export default function Register() {
    const email = useRef()
    const username = useRef()
    const password = useRef()

    return (
        <div className="login-page center-container">
            <div className="login-window">
                <h1 className="login-title">Create an account</h1>

                <form>
                    <div className="column-container">
                        <p className="category-text">EMAIL</p>
                        <input className="input-field" type="email" ref={email} size="30" required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">USERNAME</p>
                        <input className="input-field" ref={username} size="30" required />
                    </div>
                    <div className="column-container">
                        <p className="category-text">PASSWORD</p>
                        <input className="input-field" type="password" ref={password} size="30" required />
                    </div>

                    <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(), submit(email.current, username.current, password.current) }} value="CONTINUE" />
                    <p className="login-redirect">Already have an account? <a className="link" href="login">Log In</a></p>
                </form>
            </div>
        </div>
    )
}