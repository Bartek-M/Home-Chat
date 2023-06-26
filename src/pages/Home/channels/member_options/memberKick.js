import { useActive, useChannels, useFlash } from "../../../../context";
import { apiSend } from "../../../../utils";

function kick(button, member, channel_id, setChannels, setFlash, close) {
    apiSend(button, "memberKick", {}, "DELETE", [channel_id, member.id]).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")
            if (res.errors.user) return setFlash(res.errors.user, "error")
        }

        if (res.message === "200 OK") {
            setChannels(current_channels => {
                current_channels[channel_id].users.filter(user => { if (user.id !== member.id) return user })
                return current_channels
            })

            close("channelMembers")
            return setFlash(`Kicked '${member.name}'`)
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function MemberKick({ props }) {
    const { close } = props

    const [, setChannels] = useChannels()
    const [active,] = useActive()
    const setFlash = useFlash()

    const channel = active.channel
    const member = active.user

    return (
        <div className="settings-edit-card center-column-container">
            <div><h3>Kick '{member.name}' from '{channel.name}'</h3></div>
            <div><p className="edit-card-info">Are you sure you want to kick '{member.name}' from '{channel.name}'?</p></div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close("channelMembers")}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" onClick={(e) => { e.preventDefault(); kick(e.target, member, channel.id, setChannels, setFlash, close) }} value="Kick" />
            </div>
        </div>
    )
}