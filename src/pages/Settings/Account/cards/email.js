import { useRef } from "react"

import { apiSend } from "../../../../utils"
import { useFlash, useUser } from "../../../../context"

function updateEmail(button, user, email, password, setFlash, close) {
    if (!password.value || user.email === email.value) return

    apiSend(button, "me", {
        category: "email",
        data: email.value,
        password: password.value
    }, "PATCH", "@me").then(res => {        
        if (res.errors) {
            document.getElementById("email-error").innerText = res.errors.email ? `- ${res.errors.email}` : "*"
            document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : "*"
            return
        }

        if (res.message === "200 OK") {
            close()
            return setFlash("Check your email to finish!")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function Email({ props }) {
    const { close } = props

    const [user,] = useUser()
    const setFlash = useFlash()

    const email = useRef()
    const password = useRef()

    return (
        <form className="settings-edit-card center-column-container">
            <div className="card-title-wrapper center-column-container">
                <h2>Change your email</h2>
                <div className="warning-wrapper">This will only begin changing process. You will receive a verification on your new email to confirm the change.</div>
                <p className="edit-card-info">Enter a new email and your existing password.</p>
                <button className="card-close center-container" type="button" onClick={() => close()}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <div className="column-container">
                <p className="category-text">EMAIL <span className="error-category-text" id="email-error">*</span></p>
                <input className="input-field" autoFocus type="email" ref={email} maxLength={50} required />

                <p className="category-text">CURRENT PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                <input className="input-field" type="password" ref={password} maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); updateEmail(e.target, user, email.current, password.current, setFlash, close) }} value="Done" />
            </div>
        </form>
    )
}