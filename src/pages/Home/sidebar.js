import { useMemo } from "react"
import { useActive, useChannels, useFriends, useUser } from "../../context"

import { Tooltip } from "../../components"

function openChannel(channel, activeChannel, setActive) {
    if (activeChannel && activeChannel.id === channel.id) return
    setActive({ channel: channel })
}

function getLastMessage(channel) {
    if (channel.messages && channel.messages[channel.messages.length - 1]) return channel.messages[channel.messages.length - 1].create_time
    if (channel.last_message) return channel.last_message

    return null
}

export function Sidebar({ settings, card, setSettings, setCard }) {
    const [user,] = useUser()
    const [channels,] = useChannels()
    const [friends,] = useFriends()
    const [active, setActive] = useActive()

    const sortedChannels = useMemo(() => {
        if (!Object.values(channels)) return []

        return Object.values(channels).sort((a, b) => {
            const aLastMessage = getLastMessage(a)
            const bLastMessage = getLastMessage(b)

            return (bLastMessage > b.join_time ? bLastMessage : b.join_time) - (aLastMessage > a.join_time ? aLastMessage : a.join_time)
        })
    }, [Object.values(channels)])

    return (
        <nav className="main-sidebar column-container scroller">
            <li className={`main-sidebar-item center-container ${settings ? "active" : ""}`}>
                <div className="main-sidebar-pill"></div>
                {(user.notifications && user.notifications_friend && friends && friends.pending && Object.keys(friends.pending).length) ? <div className="notification-dot"></div> : null}
                <Tooltip text="Settings" type="right">
                    <button className="main-sidebar-icon sidebar-settings-icon center-container" onClick={() => { setSettings(true) }}>
                        <svg width="24" height="24" viewBox="0 0 16 16">
                            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                        </svg>
                    </button>
                </Tooltip>
            </li>
            <li className={`main-sidebar-item center-container ${card === "channelCreator" ? "active" : ""}`}>
                <div className="main-sidebar-pill"></div>
                <Tooltip text="Create" type="right">
                    <button className="main-sidebar-icon sidebar-settings-icon center-container" onClick={() => { setCard("channelCreator") }}>
                        <svg width="32" height="32" viewBox="0 0 16 16">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                    </button>
                </Tooltip>
            </li>
            <hr className="separator" />
            <>
                {sortedChannels && sortedChannels.map(channel => (
                    <li className={`main-sidebar-item center-container ${(active.channel && channel.id === active.channel.id) ? "active" : ""}`} key={`channel-${channel.id}`}>
                        <div className="main-sidebar-pill"></div>
                        {(
                            (user.notifications && user.notifications_message) &&
                            (active.channel && channel.id !== active.channel.id) &&
                            (channel.last_message > channel.notifications)
                        ) ? <div className="notification-dot"></div> : null}
                        <Tooltip text={channel.name} note={channel.display_name ? channel.display_name : null} type="right">
                            <button className="center-container" onClick={() => openChannel(channel, active.channel, setActive)}>
                                {channel.icon !== "loading"
                                    ? <img className="main-sidebar-icon skeleton" draggable={false} src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`} onLoad={(e) => e.target.classList.remove("skeleton")} />
                                    : <div className="main-sidebar-icon skeleton" />
                                }
                            </button>
                        </Tooltip>
                    </li>
                ))}
            </>
        </nav>
    )
}