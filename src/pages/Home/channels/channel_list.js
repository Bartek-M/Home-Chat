import { useChannels } from "../../../context"

function open_channel(channel_id, active, setChannels) {
    // if (active) return

    setChannels(channels => {
        return channels.filter(channel => {
            if (channel.active) channel.active = false
            else if (channel.id === channel_id) channel.active = true

            return channel
        })
    })
}

export function ChannelList() {
    const [channels, setChannels] = useChannels()

    return (
        <div className="main-sidebar-elements center-column-container">
            {channels && channels.map(channel => (
                <li className={`main-sidebar-item center-container ${channel.active ? "active" : ""}`} key={`channel-${channel.id}`} >
                    <div className="main-sidebar-pill"></div>
                    <button className="center-container" onClick={() => open_channel(channel.id, channel.active, setChannels)}>
                        <img className="main-sidebar-icon" src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`} />
                    </button>
                </li>
            ))}
        </div>
    )
}