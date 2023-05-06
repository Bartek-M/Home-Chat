import { useMemo } from "react"
import { useChannels } from "../../../context"

export function ChannelView({setCard}) {
    const [channels,] = useChannels()

    const channel = useMemo(() => {
        if (!channels) return null
        return channels.find(channel => channel.active) 
    }, [channels])

    return (
        <>
            {!channel
                ? <div className="main-view center-container">
                    <svg className="homechat-icon" width="92px" height="92px" fill="var(--COLOR_3)" viewBox="0 0 16 16">
                        <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                    </svg>
                </div>
                : <div className="main-view spaced-column-container">
                    <div className="channel-title spaced-container">
                        <div className="center-container">
                            <img className="channel-icon" src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`}/>
                            <p className="channel-name">{channel.name}</p>
                        </div>
                        <button className="center-container" id="channel-settings" onClick={() => setCard("channel_settings")}>
                            <svg width="28" height="28" viewBox="0 0 16 16">
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                            </svg>
                        </button>
                    </div>
                    <div className="column-container scroller-container" id="chat-window">
                        <div id="messages-list"></div>
                        <div className="scroller-spacer"></div>
                    </div>
                    <form className="writing-box container" id="message-form">
                        <div className="chat-inpt-wrapper scroller-container">
                            <div id="chat-inpt" contentEditable></div>
                        </div>
                        <input className="submit-btn" type="submit" value="SEND"/>
                    </form>
                </div>
            }
        </>
    )
}