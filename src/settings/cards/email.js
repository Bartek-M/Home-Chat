import { useRef } from "react"

import { api_send } from "../../api"
import { flash_message } from "../../functions"

function update_email(user, setUser, email, password, close) {
    if (!password.value || user.email === email.value) return

    api_send("user", {
        category: "email",
        data: email.value,
        password: password.value
    }, "@me").then(res => {
        if (res.errors) {
            document.getElementById("email-error").innerText = res.errors.email ? `- ${res.errors.email}` : null
            document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : null

            return
        }

        if (res.message === "200 OK") {
            setUser({ ...user, email: email.value })
            close()
            flash_message("Email updated")
        }
    })
}

export default function Email({ props }) {
    const { user, setUser, close } = props

    const email = useRef()
    const password = useRef()

    return (
        <>
            <div className="center-column-container">
                <h2>Change your email</h2>
                <p className="edit-card-info">Enter a new email and your existing password.</p>
                <button className="card-close center-container" onClick={close}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <form className="edit-card-form center-column-container">
                <div className="column-container">
                    <p className="category-text">EMAIL <span className="error-category-text" id="email-error"></span></p>
                    <input className="input-field" type="email" ref={email} defaultValue={user.email} maxLength={50} required />

                    <p className="category-text">CURRENT PASSWORD <span className="error-category-text" id="password-error"></span></p>
                    <input className="input-field" type="password" ref={password} maxLength={50} required />
                </div>
                <input className="edit-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); update_email(user, setUser, email.current, password.current, close) }} value="Done" />
            </form>
        </>
    )
}