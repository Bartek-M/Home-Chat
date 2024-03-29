import { useActive, useFlash } from "../../../../context"
import { apiDelete } from "../../../../utils"

function leave(button, channel_id, channel_name, close, setFlash) {
    apiDelete(button, "channelLeave", channel_id).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")
            return setFlash("Something went wrong!", "error")
        }

        if (res.message == "200 OK") {
            close()
            return setFlash(`Left '${channel_name}'`)
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function ChannelLeave({ props }) {
    const { close } = props
    const setFlash = useFlash()

    const [active,] = useActive()
    const channel = active.channel

    return (
        <div className="settings-edit-card center-column-container">
            <div><h3>Leave '{channel.name}'</h3></div>
            <p className="edit-card-info">Are you sure you want to leave '{channel.name}'? {(channel.users && Object.keys(channel.users).length > 1) ? "You won't be able to rejoin this channel unless you are re-invited." : "This action cannot be undone and all messages will be lost."}</p>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" onClick={(e) => { e.preventDefault(); leave(e.target, channel.id, channel.name, close, setFlash) }} value="Leave" />
            </div>
        </div>
    )
}