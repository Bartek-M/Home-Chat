import { useRef } from "react"

import { useFlash, useUser } from "../../../../context"
import { apiSend } from "../../../../utils"

function update_username(button, user, setUser, name, password, close, setFlash) {
    if (!password.value || user.name == name.value) return

    apiSend(button, "user", {
        category: "name",
        data: name.value,
        password: password.value
    }, "PATCH", "@me").then(res => {
        if (res.message === "429 Too Many Requests") return setFlash("Too many requests", "error")
        
        if (res.errors) {
            document.getElementById("name-error").innerText = res.errors.name ? `- ${res.errors.name}` : "*"
            document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : "*"

            return
        }

        if (res.message === "200 OK") {
            setUser((current_user) => { return { ...current_user, name: name.value.toLowerCase() } })
            close()
            return setFlash("Username updated")
        }

        setFlash("Something went wrong!", "error")
    })
}

export function Username({ props }) {
    const { close } = props

    const [user, setUser] = useUser()
    const setFlash = useFlash()

    const username = useRef()
    const password = useRef()

    return (
        <form className="settings-edit-card center-column-container">
            <div className="card-title-wrapper center-column-container">
                <h2>Change your username</h2>
                <p className="edit-card-info">Enter a new username and your existing password.</p>
                <button className="card-close center-container" type="button" onClick={() => close()}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <div className="column-container">
                <p className="category-text">USERNAME <span className="error-category-text" id="name-error">*</span></p>
                <input className="input-field" autoFocus type="text" ref={username} defaultValue={user.name} maxLength={50} required />

                <p className="category-text">CURRENT PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                <input className="input-field" type="password" ref={password} maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); update_username(e.target, user, setUser, username.current, password.current, close, setFlash) }} value="Done" />
            </div>
        </form>
    )
}