import { useRef, useState } from "react";
import { useActive, useChannels, useFlash, useUser } from "../../../../context";

import { apiSend } from "../../../../utils";
import { MFA } from "../../../../components"

function owner({ button, active, password, code, setChannels, close, setFlash }) {
    if ((password && !password.value) || (code && !code.value)) return
    if (!active || !active.channel || !active.user) return

    const channel = active.channel
    const member = active.user

    apiSend(button, "transferOwner", {
        password: password ? password.value : null,
        code: code ? code.value : null
    }, "PATCH", [channel.id, member.id]).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")

            if (document.getElementById("password-error")) return document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : "*"
            if (document.getElementById("code-error")) return document.getElementById("code-error").innerText = `- ${res.errors.code}`
            return
        }

        if (res.message === "200 OK") {
            setChannels(current_channels => {
                current_channels[channel.id].owner = member.id
                return current_channels
            })

            close()
            return setFlash(`Transferred ownership`)
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function TransferOwner({ props }) {
    const { close } = props

    const [user,] = useUser()
    const [, setChannels] = useChannels()
    const [active,] = useActive()
    const setFlash = useFlash()

    const channel = active.channel
    const member = active.user

    const [page, setPage] = useState()
    const passw = useRef()

    // Password or MFA check
    if (page && user.mfa_enabled) return <MFA title="Transfer Ownership" submit_text="Transfer Ownership" warning={true} submit_function={owner} close={() => close("channelMembers")} />
    if (page) return (
        <form className="settings-edit-card center-column-container">
            <div className="column-container"><h3>Transfer Ownership</h3></div>
            <div className="column-container">
                <p className="category-text">PASSWORD <span className="error-category-text" id="password-error" key="password-error">*</span></p>
                <input className="input-field small-card-field" type="password" autoFocus ref={passw} key="password-inpt" maxLength={10} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" value="Transfer Ownership" onClick={(e) => {
                    e.preventDefault()
                    owner({ button: e.target, active: active, password: passw.current, setChannels: setChannels, close: () => close("channelMembers"), setFlash: setFlash })
                }} />
            </div>
        </form>
    )

    return (
        <div className="settings-edit-card center-column-container">
            <h3>Transfer Ownership</h3>
            <p className="edit-card-info">This will transfer ownership of <strong>{channel.name}</strong> to <strong>{member.name}</strong>. This cannot be undone!</p>
            <div className="center-container">
                <img className="member-icon-big disabled" src={`/api/images/${user.avatar}.webp`} />
                <svg width="32" height="64" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                    <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                </svg>
                <img className="member-icon-big" src={`/api/images/${member.avatar}.webp`} />
            </div>
            <p className="edit-card-info">You will no longer have full control over this channel.</p>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close("channelMembers")}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" onClick={(e) => { e.preventDefault(); setPage(true) }} value="Continue" />
            </div>
        </div>
    )
}