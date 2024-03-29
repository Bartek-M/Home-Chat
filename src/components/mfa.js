import { useRef } from "react"
import { useNavigate } from "react-router-dom"

import { useActive, useChannels, useFlash, useUser } from "../context"

export function MFA(props) {
    const { title, submit_text, warning, submit_function, password, setPage, close, data } = props

    const [user, setUser] = useUser()
    const [, setChannels] = useChannels()
    const [active,] = useActive()
    const setFlash = useFlash()

    const navigator = useNavigate()
    const code = useRef()

    return (
        <form className="settings-edit-card center-column-container">
            <div className="column-container">
                <h3>{title}</h3>
            </div>
            <div className="column-container">
                <p className="category-text">HOME CHAT AUTH CODE <span className="error-category-text" id="code-error" key="code-error">*</span></p>
                <input className="input-field small-card-field" autoFocus ref={code} placeholder="6-digit authentication code" key="mfa-inpt" maxLength={10} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className={`card-submit-btn ${warning ? 'warning-btn' : 'submit-btn'}`} type="submit" value={submit_text} onClick={(e) => {
                    e.preventDefault()
                    submit_function({ button: e.target, navigator: navigator, user: user, setUser: setUser, setChannels: setChannels, setPage: setPage, password: password, code: code.current, data: data, active: active, setFlash: setFlash, close: close })
                }} />
            </div>
        </form>
    )
}