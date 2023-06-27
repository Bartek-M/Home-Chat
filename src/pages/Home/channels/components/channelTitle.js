import { useState } from "react"
import { createPortal } from "react-dom"

import { useChannels } from "../../../../context"
import { apiGet } from "../../../../utils"
import { ChannelMenu } from ".."

function getMembers(channel, setChannels) {
    if (channel.users) return

    apiGet("channelUsers", channel.id).then(res => {
        if (res.message !== "200 OK") return setFlash("Couldn't load channel users!", "error")
        if (!res.channel_users) return

        setChannels(current_channels => {
            current_channels[channel.id].users = res.channel_users
            return {...current_channels}
        })
    })
}

export function ChannelTitle({ channel, setCard }) {
    const [, setChannels] = useChannels()
    const [menu, setMenu] = useState({ show: false, x: 0, y: 0 })

    return (
        <div className="channel-title spaced-container">
            <div className="center-container">
                <img className="channel-icon" src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`} />
                <div className="column-container">
                    {channel.display_name && <p className="channel-name">{channel.display_name}</p>}
                    <p className={`channel-name ${channel.display_name ? "username" : ""}`}>{channel.name}</p>
                </div>
            </div>
            <button className="channel-settings center-container" onClick={(e) => { setMenu({ show: true, element: e.target, x: e.target.offsetLeft, y: e.target.offsetTop }); getMembers(channel, setChannels) }}>
                <svg width="28" height="28" viewBox="0 0 16 16">
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
            </button>
            {menu.show && createPortal(<ChannelMenu element={menu.element} x={menu.x} y={menu.y} close={() => setMenu({ show: false, element: null, x: 0, y: 0 })} setCard={setCard} />, document.getElementsByClassName("layer")[0])}
        </div>
    )
}