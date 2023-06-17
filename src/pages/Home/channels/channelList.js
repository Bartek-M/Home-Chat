import { useActive, useChannels } from "../../../context"
import { Tooltip } from "../../../components"

function openChannel(channel, activeChannel, setActive) {
    if (activeChannel && activeChannel.id === channel.id) return
    setActive({ channel: channel })
}

export function ChannelList() {
    const [channels] = useChannels()
    const [active, setActive] = useActive()

    return (
        <>
            {channels && channels.map(channel => (
                <li className={`main-sidebar-item center-container ${(active.channel && channel.id === active.channel.id) ? "active" : ""}`} key={`channel-${channel.id}`}>
                    <div className="main-sidebar-pill"></div>
                    {/* <div className="notification-dot"></div> */}
                    <Tooltip text={channel.name} note={channel.display_name ? channel.display_name : null} type="right">
                        <button className="center-container" onClick={() => openChannel(channel, active.channel, setActive)}>
                            <img className="main-sidebar-icon" src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`} />
                        </button>
                    </Tooltip>
                </li>
            ))}
        </>
    )
}