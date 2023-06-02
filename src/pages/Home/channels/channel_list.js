import { useChannels } from "../../../context"
import { Tooltip } from "../../../components"

function open_channel(channel_id, active, setChannels) {
    if (active) return

    setChannels(channels => {
        return channels.filter(channel => {
            if (channel.active) channel.active = false
            else if (channel.id === channel_id) {
                channel.active = true
                window.history.replaceState(null, "", `/channels/${channel.id}`)
            }

            return channel
        })
    })
}

export function ChannelList() {
    const [channels, setChannels] = useChannels()

    return (
        <>
            {channels && channels.map(channel => (
                <li className={`main-sidebar-item center-container ${channel.active ? "active" : ""}`} key={`channel-${channel.id}`}>
                    <div className="main-sidebar-pill"></div>
                    <Tooltip text={channel.name} note={channel.display_name ? channel.display_name : null} type="right">
                        <button className="center-container" onClick={() => open_channel(channel.id, channel.active, setChannels)}>
                            <img className="main-sidebar-icon" src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`} />
                        </button>
                    </Tooltip>
                </li>
            ))}
        </>
    )
}