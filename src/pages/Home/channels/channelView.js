import { useRef } from "react"
import { useActive } from "../../../context"

import { ChannelTitle, MessageList, ChatInput } from "."

export function ChannelView({ setCard }) {
    const [active,] = useActive()
    const channel = active.channel

    const sendBtn = useRef()

    if (!channel) return (
        <div className="main-view center-container">
            <svg width="92px" height="92px" fill="var(--COLOR_3)" viewBox="0 0 16 16">
                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
            </svg>
        </div>
    )

    return (
        <div className="main-view spaced-column-container" key={channel.id}>
            <ChannelTitle channel={channel} setCard={setCard} />
            <MessageList channel={channel} sendBtn={sendBtn} close={setCard} />
            <ChatInput channel={channel} sendBtn={sendBtn} />
        </div>
    )
}