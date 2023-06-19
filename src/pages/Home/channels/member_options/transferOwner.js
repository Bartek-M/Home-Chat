import { useActive, useChannels, useFlash } from "../../../../context";

export function TransferOwner({ props }) {
    const { close } = props

    const [, setChannels] = useChannels()
    const [active, ] = useActive()
    const setFlash = useFlash()

    const channel = active.channel
    const member = active.user

    return (
        <form className="settings-edit-card center-column-container">
            <div className="column-container">
                <h3>Transfer Ownership to '{member.name}'</h3>
                <div className="warning-wrapper">Are you sure that you want to transfer ownership? You will no longer have full control over this channel.</div>
            </div>
            <div className="column-container">
                <p className="category-text">PASSWORD <span className="error-category-text" id="password-error" key="password-error">*</span></p>
                <input className="input-field small-card-field" type="password" autoFocus ref={passw} key="password-inpt" maxLength={10} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" value="Delete" onClick={(e) => {
                    e.preventDefault()
                    transferOwner({ button: e.target, data: [channel.id, channel.name], password: passw.current, setChannels: setChannels, close: close, setFlash: setFlash })
                }} />
            </div>
        </form>
    )
}