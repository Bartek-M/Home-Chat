import { useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useFlash } from "../../context";
import { apiSend } from "../../utils";


function changePassword(button, navigator, password, ticket, setFlash) {
    if (!password.value) return
    if (!ticket) return setFlash("Invalid ticket", "error")

    apiSend(button, "recoverPassw", {
        password: password.value,
        ticket: ticket
    }, "POST").then((res) => {
        if (res.errors) return document.getElementById("passw-error").innerText = res.errors.password ? `- ${res.errors.password}` : "*"
        if (["401 Unauthorized", "403 Forbidden"].includes(res.message)) return setFlash("Invalid ticket", "error")

        if (res.message === "200 OK") {
            setFlash("Password updated")
            return setTimeout(() => navigator("/"), 200)
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function ResetPassword() {
    const navigator = useNavigate()

    const [searchParams,] = useSearchParams()
    const setFlash = useFlash()

    const passw = useRef()

    return (
        <div className="login-page center-container">
            <div className="auth-window">
                <h1 className="login-title">Change Your Password</h1>

                <form>
                    <div className="column-container">
                        <p className="category-text">NEW PASSWORD <span className="error-category-text" id="passw-error" key="passw-error">*</span></p>
                        <input className="input-field" autoFocus type="password" ref={passw} key="passw-inpt" maxLength={50} required />
                    </div>

                    <input className="login-submit submit-btn" type="submit" onClick={(e) => { e.preventDefault(); changePassword(e.target, navigator, passw.current, searchParams.get("ticket"), setFlash)}} value="Change Password" />
                    <p className="login-redirect"><a className="link" href="/login">Login</a></p>
                </form>
            </div>
        </div>
    )
}