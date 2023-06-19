import { useRef } from "react";
import { useActive, useChannels, useFlash } from "../../../../context";


export function MemberNick({ props }) {
    const { close } = props

    const [, setChannels] = useChannels()
    const [active, ] = useActive()
    const setFlash = useFlash()
    
    const member = active.user
    const nick = useRef()


    return (
        <div className="settings-edit-card center-column-container">
            <div className="column-container">
                <h3>Change Nickname</h3>
            </div>
            <div className="column-container">
                <p className="category-text">NICKNAME <span className="error-category-text" id="nick-error" key="password-error">*</span></p>
                <input className="input-field small-card-field" type="text" autoFocus ref={nick} key="nick-inpt" maxLength={10} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" value="Delete" onClick={(e) => {
                    e.preventDefault()
                    changeNick(e.target, setFlash)
                }} />
            </div>
        </div>
    )
}