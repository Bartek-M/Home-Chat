import { useRef } from "react";
import { useActive, useChannels, useFlash } from "../../../../context";

import { apiSend } from "../../../../utils";

function changeNick(button, member, channel_id, nick, setChannels, close, setFlash) {
    if (!nick || nick.value === member.nick) return

    apiSend(button, "memberNick", { nick: nick.value }, "PATCH", [channel_id, member.id]).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")
            if (res.errors.user) return setFlash(res.errors.user, "error")

            return document.getElementById("nick-error").innerText = res.errors.nick ? `- ${res.errors.nick}` : "*"
        }

        if (res.message === "200 OK") {
            setChannels(current_channels => {
                return current_channels.filter(fltr_channel => {
                    if (fltr_channel.id === channel_id) fltr_channel.users = fltr_channel.users.filter(user => {
                        if (user.id === member.id) user.nick = nick.value
                        return user
                    })

                    return fltr_channel
                })
            })

            close()
            return setFlash(`Changed ${member.name}'s nickname`)
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function MemberNick({ props }) {
    const { close } = props

    const [, setChannels] = useChannels()
    const [active,] = useActive()
    const setFlash = useFlash()

    const member = active.user
    const nick = useRef()

    return (
        <div className="settings-edit-card center-column-container">
            <div className="column-container">
                <h3>Change Nickname</h3>
                <p className="edit-card-info">Nicknames are visible for everyone</p>
            </div>
            <div className="column-container">
                <p className="category-text">NICKNAME <span className="error-category-text" id="nick-error" key="nick-error">*</span></p>
                <input className="input-field small-card-field" type="text" autoFocus ref={nick} placeholder={member.name} defaultValue={member.nick} key="nick-inpt" required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close("channelMembers")}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" value="Change" onClick={(e) => {
                    e.preventDefault()
                    changeNick(e.target, member, active.channel.id, nick.current, setChannels, () => close("channelMembers"), setFlash)
                }} />
            </div>
        </div>
    )
}