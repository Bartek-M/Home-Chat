import { useMemo } from "react"
import { useChannels } from "../../../context"

import { api_delete, flash_message } from "../../../utils"

function leave(channel_id, channel_name, setChannels, close) {
    api_delete("channel_leave", channel_id).then((res) => {
        if (res.errors) {
            if (res.errors.channel) return flash_message(res.errors.channel, "error")
            return flash_message("Something went wrong!", "error")
        }

        if (res.message == "200 OK") {
            setChannels(channels => {
                channels = channels.filter(channel => channel.id !== channel_id)

                if (channels.length > 0) {
                    channels[0].active = true
                    window.history.replaceState(null, "", `/channels/${channels[0].id}`)
                } else { window.history.replaceState(null, "", `/`) }

                return channels
            })

            close()
            return flash_message(`Left '${channel_name}'`)
        }

        flash_message("Something went wrong!", "error")
    })
}


export function ChannelLeave({ props }) {
    const { close } = props
    const [channels, setChannels] = useChannels()

    const channel = useMemo(() => {
        if (!channels) return null
        return channels.find(channel => channel.active)
    }, [channels])

    return (
        <div className="settings-edit-card center-column-container">
            <div><h3>Leave '{channel.name}'</h3></div>
            <p className="edit-card-info">Are you sure you want to leave '{channel.name}'? {channel.users.length > 1 ? "You won't be able to rejoin this channel unless you are re-invited." : "This action cannot be undone and all messages will be lost."}</p>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" onClick={(e) => { e.preventDefault(); leave(channel.id, channel.name, setChannels, close) }} value="Leave" />
            </div>
        </div>
    )
}