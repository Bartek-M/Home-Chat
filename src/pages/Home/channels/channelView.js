import { useState } from "react"
import { createPortal } from "react-dom"

import { useActive } from "../../../context"
import { ChannelMenu } from "."

export function ChannelView({ setCard }) {
    const [active,] = useActive()
    const channel = active.channel

    const [menu, setMenu] = useState({ show: false, x: 0, y: 0 })

    return (
        <>
            {!channel
                ? <div className="main-view center-container">
                    <svg width="92px" height="92px" fill="var(--COLOR_3)" viewBox="0 0 16 16">
                        <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                    </svg>
                </div>
                : <div className="main-view spaced-column-container">
                    <div className="channel-title spaced-container">
                        <div className="center-container">
                            <img className="channel-icon" src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`} />
                            <div className="column-container">
                                {channel.display_name && <p className="channel-name">{channel.display_name}</p>}
                                <p className={`channel-name ${channel.display_name ? "username" : ""}`}>{channel.name}</p>
                            </div>
                        </div>
                        <button className="channel-settings center-container" onClick={(e) => setMenu({ show: true, element: e.target, x: e.target.offsetLeft, y: e.target.offsetTop })}>
                            <svg width="28" height="28" viewBox="0 0 16 16">
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                            </svg>
                        </button>
                        {menu.show && createPortal(<ChannelMenu element={menu.element} x={menu.x} y={menu.y} close={() => setMenu({ show: false, element: null, x: 0, y: 0 })} setCard={setCard} />, document.getElementsByClassName("layer")[0])}
                    </div>
                    <div className="column-container scroller-container" id="chat-window">
                        <div id="messages-list"></div>
                        <div className="scroller-spacer"></div>
                    </div>
                    <form className="chat-inpt-wrapper container" onSubmit={e => e.preventDefault()}>
                        <div className="chat-inpt-scroller scroller-container">
                            <div className="chat-inpt" autoFocus contentEditable></div>
                        </div>
                        <div className="chat-send-wrapper center-container">
                            <hr className="chat-separator" />
                            <button className="chat-send-btn center-container">
                                <svg width="20" height="20" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                    <path d="M8.2738 8.49222L1.99997 9.09877L0.349029 14.3788C0.250591 14.691 0.347154 15.0322 0.595581 15.246C0.843069 15.4597 1.19464 15.5047 1.48903 15.3613L15.2384 8.7032C15.5075 8.57195 15.6781 8.29914 15.6781 8.00007C15.6781 7.70101 15.5074 7.4282 15.2384 7.29694L1.49839 0.634063C1.20401 0.490625 0.852453 0.535625 0.604941 0.749376C0.356493 0.963128 0.259941 1.30344 0.358389 1.61563L2.00932 6.89563L8.27093 7.50312C8.52405 7.52843 8.71718 7.74125 8.71718 7.99531C8.71718 8.24938 8.52406 8.46218 8.27093 8.4875L8.2738 8.49222Z" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            }
        </>
    )
}