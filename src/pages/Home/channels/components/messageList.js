import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useChannels, useUser } from "../../../../context"

import { apiGet, formatTime, smoothScroll } from "../../../../utils"
import { UserCard } from "../../../../components"

export function MessageList({ channel, close }) {
    const [user,] = useUser()
    const [, setChannels] = useChannels()
    const [menu, setMenu] = useState({ id: null, element: null, type: null, x: 0, y: 0 })

    useEffect(() => {
        if (channel.messages) return

        apiGet("channelMessages", channel.id).then(res => {
            if (res.message !== "200 OK") return setFlash("Couldn't load channel messages!", "error")
            if (!res.channel_messages) return

            setChannels(current_channels => {
                current_channels[channel.id].messages = res.channel_messages
                return { ...current_channels }
            })
        })
    }, [channel.id])

    const message_list = useRef()
    useEffect(() => smoothScroll(message_list.current), [channel.messages ? channel.messages.length : channel.messages])

    return (
        <div className="chat-window column-container scroller-container" ref={message_list}>
            {(channel.messages && channel.messages.length)
                ? <>
                    {user.message_display === "standard"
                        ? (
                            channel.messages.map((message, index) => {
                                const author = channel.users[message.author] ? channel.users[message.author] : {}

                                if (channel.messages[index - 1] && channel.messages[index - 1].author === message.author && (message.create_time - channel.messages[index - 1].create_time) < 360) return (
                                    <li className="message-list-item repeated-message-list-item container" key={message.id}>
                                        <div className="message-hidden-time center-container">{formatTime(message.create_time, "time")}</div>
                                        <div className="message-content">
                                            <div className="message-text">{message.content}</div>
                                        </div>
                                    </li>
                                )

                                return (
                                    <li className="message-list-item container" key={message.id}>
                                        <img className="avatar" src={`/api/images/${author.avatar}.webp`} onClick={(e) => setMenu({ id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().right, y: e.target.getBoundingClientRect().top })} />
                                        <div className="message-content">
                                            <div className="message-info container">
                                                <p className={author.name ? "message-author" : "message-dim-text"}>{(author.display_name || author.nick) ? (author.nick || author.display_name) : (author.name || "Unknown")}</p>
                                                <p className="message-dim-text">{formatTime(message.create_time)}</p>
                                            </div>
                                            <div className="message-text">{message.content}</div>
                                        </div>
                                        {(menu.id === message.id && menu.type === "userCard") &&
                                            createPortal(<UserCard element={menu.element} member={author} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />, document.getElementsByClassName("layer")[0])
                                        }
                                    </li>
                                )
                            })
                        )
                        : (
                            channel.messages.map(message => {
                                const author = channel.users[message.author] ? channel.users[message.author] : {}
                                
                                return (
                                    <li className="compact-msg container" key={message.id}>
                                        <div className="compact-msg-time-info">{formatTime(message.create_time, "time")}</div>
                                        <div className={author.name ? "compact-msg-user-info" : "compact-msg-dim-name"} onClick={(e) => setMenu({ id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().right, y: e.target.getBoundingClientRect().top })}>
                                            {(author.display_name || author.nick) ? (author.nick || author.display_name) : (author.name || "Unknown")}
                                        </div>
                                        <div className="compact-msg-text">{message.content}</div>
                                        {(menu.id === message.id && menu.type === "userCard") &&
                                            createPortal(<UserCard element={menu.element} member={author} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />, document.getElementsByClassName("layer")[0])
                                        }
                                    </li>
                                )
                            })
                        )
                    }
                    <div className="scroller-spacer"></div>
                </>
                : null
            }
        </div>
    )
}