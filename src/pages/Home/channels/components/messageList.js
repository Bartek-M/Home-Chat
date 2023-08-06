import { useEffect, useRef, useState } from "react"
import { useChannels, useFlash, useUser } from "../../../../context"

import { apiGet, smoothScroll } from "../../../../utils"
import { Message, CompactMessage, SkeletonList } from "./messages"

function loadMessages(button, channel, setChannels, setFlash) {
    if (button.disabled) return
    button.disabled = true

    apiGet(!channel.messages ? "channelMessages" : "channelMessagesBefore", !channel.messages ? channel.id : [channel.id, channel.messages[0].id]).then(res => {
        if (res.message !== "200 OK") return setFlash("Couldn't load messages!", "error")
        if (!res.channel_messages) return

        setChannels(current_channels => {
            if (current_channels[channel.id].messages) current_channels[channel.id].messages = [...res.channel_messages, ...current_channels[channel.id].messages]
            else current_channels[channel.id].messages = res.channel_messages

            return { ...current_channels }
        })
    }).finally(() => button.disabled = false)
}

export function MessageList({ channel, close }) {
    const [user,] = useUser()
    const [, setChannels] = useChannels()
    const setFlash = useFlash()

    const [menu, setMenu] = useState({ id: null, element: null, type: null, x: 0, y: 0 })
    const [showScrollDown, setShowScrollDown] = useState(false)
    const [isWaiting, setIsWaiting] = useState(true)

    const messageList = useRef()
    const messageLoader = useRef()
    const scrollerSpacer = useRef()

    useEffect(() => {
        if (!channel.messages) return
        smoothScroll(messageList.current)
    }, [channel.messages ? channel.messages[channel.messages.length - 1] : channel.messages])

    useEffect(() => {
        if (channel.messages) return
        loadMessages(messageList.current ? messageList.current : {}, channel, setChannels, setFlash)

        const delay = setTimeout(() => setIsWaiting(false), 400);
        return () => clearTimeout(delay)
    }, [channel.id])

    useEffect(() => {
        if (!messageList.current || !channel.messages || !channel.messages.length || isWaiting === null) return

        const handleScroll = () => {
            setShowScrollDown(!(messageList.current.scrollHeight - messageList.current.scrollTop - 100 <= messageList.current.clientHeight))

            if (!messageLoader.current) return
            const rect = messageLoader.current.getBoundingClientRect()

            if (rect.top > messageList.current.clientHeight || rect.bottom < 0 || channel.messages[0].first) return
            loadMessages(messageList.current, channel, setChannels, setFlash)
        }

        handleScroll()
        messageList.current.addEventListener("scroll", handleScroll)
        return () => { if (!messageList.current) return; messageList.current.removeEventListener("scroll", handleScroll) }
    }, [messageList.current, channel.messages ? channel.messages.length : channel.messages])

    
    if (isWaiting && !channel.messages) return null
    if (!channel.messages) return (
        <SkeletonList messageDisplay={user.message_display} />
    )

    return (
        <div className="chat-window-wrapper scroller" ref={messageList}>
            {(channel.messages && channel.messages.length)
                ? <div className="chat-window-content column-container">
                    {!channel.messages[0].first
                        ? <SkeletonList messageDisplay={user.message_display} messageLoader={messageLoader} size={4} />
                        : null
                    }
                    {user.message_display === "standard"
                        ? (channel.messages.map((message, index) => {
                            return (!message.system
                                ? <Message message={message} menu={menu} setMenu={setMenu} close={close} index={index} key={message.id} />
                                : <p className="system-message" key={message.id}>{message.content}</p>
                            )
                        }))
                        : (channel.messages.map(message => {
                            return (!message.system
                                ? <CompactMessage message={message} menu={menu} setMenu={setMenu} close={close} key={message.id} />
                                : <p className="system-message" key={message.id}>{message.content}</p>
                            )
                        }))
                    }
                    <div className="scroller-spacer" ref={scrollerSpacer} />
                    {showScrollDown &&
                        <button className="scroll-down-btn center-container" onClick={() => smoothScroll(messageList.current)}>
                            <svg width="32" height="32" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z" />
                            </svg>
                        </button>
                    }
                </div>
                : <div className="category-text center-container" style={{ marginTop: "1rem" }}>NO MESSAGE HISTORY</div>
            }
        </div>
    )
}