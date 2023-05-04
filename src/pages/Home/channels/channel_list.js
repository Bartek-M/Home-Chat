import { useChannels } from "../../../context"

export function ChannelList() {
    const [channels, setChannels] = useChannels()
    
    return (
        <>
            {channels && channels.map(channel => (
                <li className="main-sidebar-item center-container" key={`channel-${channel.id}`}>
                    <div className="main-sidebar-pill"></div>
                    <button>
                        <img className="main-sidebar-icon" src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`} />
                    </button>
                </li>
            ))}
        </>
    )
}