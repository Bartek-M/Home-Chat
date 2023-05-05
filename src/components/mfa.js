import { useRef } from "react"
import { useNavigate } from "react-router-dom"

import { useUser } from "../context"

export function MFA(props) {
    const { title, submit_text, submit_function, password, setPage, close, data } = props
    const [user, setUser] = useUser()

    const navigator = useNavigate()
    const code = useRef()

    return (
        <form className="settings-edit-card center-column-container" onSubmit={(e) => {
            e.preventDefault()
            submit_function({ navigator: navigator, user: user, setUser: setUser, setPage: setPage, password: password, code: code.current, data: data, close: close })
        }}>
            <div className="column-container">
                <h3>{title}</h3>
            </div>
            <div className="column-container">
                <p className="category-text">HOME CHAT AUTH CODE <span className="error-category-text" id="code-error" key="code-error">*</span></p>
                <input className="input-field small-card-field" autoFocus ref={code} key="mfa-inpt" maxLength={10} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" value={submit_text} />
            </div>
        </form>
    )
}