import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useChannels, useUser } from "../../../../context"

import { apiGet, formatTime, smoothScroll } from "../../../../utils"
import { UserCard } from "../../../../components"
import { MessageOptions } from "./messageOptions"

const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

export function MessageList({ channel, close }) {
    const [user,] = useUser()
    const [, setChannels] = useChannels()

    const [menu, setMenu] = useState({ id: null, element: null, type: null, x: 0, y: 0 })
    const [showScrollDown, setShowScrollDown] = useState(false)
    const [isWaiting, setIsWaiting] = useState(true)

    const messageList = useRef()
    useEffect(() => {
        setChannels(current_channels => {
            if (!current_channels[channel.id].notifications || current_channels[channel.id].notifications === "0") return current_channels
            if (current_channels[channel.id].notifications >= current_channels[channel.id].last_message) return current_channels

            current_channels[channel.id].notifications = current_channels[channel.id].last_message
            return { ...current_channels }
        })

        smoothScroll(messageList.current)
    }, [channel.messages ? channel.messages.length : channel.messages, channel.id])

    useEffect(() => {
        setIsWaiting(true)

        if (channel.messages) return
        const delay = setTimeout(() => setIsWaiting(false), 400);

        apiGet("channelMessages", channel.id).then(res => {
            if (res.message !== "200 OK") return setFlash("Couldn't load channel messages!", "error")
            if (!res.channel_messages) return

            setChannels(current_channels => {
                current_channels[channel.id].messages = res.channel_messages
                return { ...current_channels }
            })
        })

        return () => clearTimeout(delay)
    }, [channel.id])

    useEffect(() => {
        if (!messageList.current) return

        const handleScroll = () => {
            const container = messageList.current
            setShowScrollDown(!(container.scrollHeight - container.scrollTop - 100 <= container.clientHeight))
        }
        messageList.current.addEventListener("scroll", handleScroll)

        return () => { if (!messageList.current) return; messageList.current.removeEventListener("scroll", handleScroll) }
    }, [messageList.current])

    if (isWaiting && !channel.messages) return null
    if (!channel.messages) {
        return (
            <div className="chat-window column-container" style={{ overflow: "hidden" }}>
                {user.message_display === "standard"
                    ? [...Array(50)].map((_, i) => (
                        <li className="message-list-item container" key={i}>
                            <div className="avatar skeleton" />
                            <div className="message-content" style={{ minWidth: "100px", width: "400px" }}>
                                <div className="container" style={{ width: "100px" }}>
                                    <div className="skeleton skeleton-text" />
                                </div>
                                <div className="skeleton skeleton-text" />
                            </div>
                        </li>
                    ))
                    : [...Array(100)].map((_, i) => (
                        <li className="compact-msg container" key={i}>
                            <div className="skeleton skeleton-text" style={{ width: "30px" }} />
                            <div className="skeleton skeleton-text" style={{ width: "60px", margin: "3px 0.5rem 3px 0.25rem" }} />
                            <div className="skeleton skeleton-text" style={{ width: "400px" }} />
                        </li>
                    ))
                }
            </div>
        )
    }

    return (
        <div className="chat-window column-container scroller-container" ref={messageList}>
            {(channel.messages && channel.messages.length)
                ? <>
                    {user.message_display === "standard"
                        ? (
                            channel.messages.map((message, index) => {
                                var author = channel.users[message.author] ? channel.users[message.author] : {}
                                if (message.author === user.id) author = { ...author, ...user }

                                const content = !message.content.match(URL_REGEX)
                                    ? message.content
                                    : message.content.split(" ").map((part, index) => {
                                        return (URL_REGEX.test(part) ? <span key={index}><a className="link" target="_blank" href={part.toLowerCase().startsWith('http') ? part : `//${[part]}`}>{part}</a> </span> : part + " ")
                                    })

                                if (channel.messages[index - 1] && channel.messages[index - 1].author === message.author && (message.create_time - channel.messages[index - 1].create_time) < 360) return (
                                    <li className="message-list-item repeated-message-list-item container" key={message.id}>
                                        <div className="message-hidden-time center-container">{formatTime(message.create_time, "time")}</div>
                                        <div className="message-content">
                                            <div className="message-text">{content}</div>
                                        </div>
                                        <MessageOptions message={message} />
                                    </li>
                                )

                                return (
                                    <li className="message-list-item container" key={message.id}>
                                        <img className="avatar skeleton" draggable={false} src={`/api/images/${author.avatar}.webp`} onClick={(e) => setMenu({ id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().right, y: e.target.getBoundingClientRect().top })} onLoad={(e) => e.target.classList.remove("skeleton")} />
                                        <div className="message-content">
                                            <div className="message-info container">
                                                <p className={author.name ? "message-author short-text" : "message-dim-text short-text"}>{(author.display_name || author.nick) ? (author.nick || author.display_name) : (author.name || "Unknown")}</p>
                                                <p className="message-dim-text">{formatTime(message.create_time)}</p>
                                            </div>
                                            <div className="message-text">{content}</div>
                                        </div>
                                        <MessageOptions message={message} />
                                        {(menu.id === message.id && menu.type === "userCard") &&
                                            createPortal(<UserCard element={menu.element} member={author.id ? author : { id: message.author }} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />, document.getElementsByClassName("layer")[0])
                                        }
                                    </li>
                                )
                            })
                        )
                        : (
                            channel.messages.map(message => {
                                var author = channel.users[message.author] ? channel.users[message.author] : {}
                                if (message.author === user.id) author = { ...author, ...user }

                                const content = !message.content.match(URL_REGEX)
                                    ? message.content
                                    : message.content.split(" ").map((part, index) => {
                                        return (URL_REGEX.test(part) ? <span key={index}><a className="link" target="_blank" href={part.toLowerCase().startsWith('http') ? part : `//${[part]}`}>{part}</a> </span> : part + " ")
                                    })

                                return (
                                    <li className="compact-msg container" key={message.id}>
                                        <div className="compact-msg-time-info">{formatTime(message.create_time, "time")}</div>
                                        <div className={author.name ? "compact-msg-user-info short-text" : "compact-msg-user-info compact-msg-dim-name short-text"} onClick={(e) => setMenu({ id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().right, y: e.target.getBoundingClientRect().top })}>
                                            {(author.display_name || author.nick) ? (author.nick || author.display_name) : (author.name || "Unknown")}
                                        </div>
                                        <div className="compact-msg-text">{content}</div>
                                        <MessageOptions message={message} />
                                        {(menu.id === message.id && menu.type === "userCard") &&
                                            createPortal(<UserCard element={menu.element} member={author.id ? author : { id: message.author }} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />, document.getElementsByClassName("layer")[0])
                                        }
                                    </li>
                                )
                            })
                        )
                    }
                    <div className="scroller-spacer" />
                    {showScrollDown &&
                        <button className="scroll-down-btn center-container" onClick={() => smoothScroll(messageList.current)}>
                            <svg width="32" height="32" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z" />
                            </svg>
                        </button>
                    }
                </>
                : <div className="category-text center-container" style={{ marginTop: "1rem" }}>NO MESSAGE HISTORY</div>
            }
        </div>
    )
}