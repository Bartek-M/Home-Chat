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
    useEffect(() => smoothScroll(message_list.current), [channel ? channel.messages : null])

    return (
        <div className="chat-window column-container scroller-container" ref={message_list}>
            {(channel.messages && channel.messages.length)
                ? <>
                    {user.message_display === "standard"
                        ? (
                            channel.messages.map((message, index) => (
                                (channel.messages[index - 1] && channel.messages[index - 1].author.id === message.author.id && (message.create_time - channel.messages[index - 1].create_time) < 360)
                                    ? <li className="message-list-item repeated-message-list-item container" key={message.id}>
                                        <div className="message-hidden-time center-container">{formatTime(message.create_time, "time")}</div>
                                        <div className="message-content">
                                            <div className="message-text">{message.content}</div>
                                        </div>
                                    </li>
                                    : <li className="message-list-item container" key={message.id}>
                                        <img className="avatar" src={`/api/images/${message.author.avatar}.webp`} onClick={(e) => setMenu({ id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().right, y: e.target.getBoundingClientRect().top })} />
                                        <div className="message-content">
                                            <div className="message-info container">
                                                <p className="message-author">{message.author.display_name ? message.author.display_name : message.author.name}</p>
                                                <p className="message-time">{formatTime(message.create_time)}</p>
                                            </div>
                                            <div className="message-text">{message.content}</div>
                                        </div>
                                        {(menu.id === message.id && menu.type === "userCard") &&
                                            createPortal(<UserCard element={menu.element} member={message.author} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />, document.getElementsByClassName("layer")[0])
                                        }
                                    </li>
                            ))
                        )
                        : (
                            channel.messages.map(message => (
                                <li className="compact-msg container" key={message.id}>
                                    <div className="compact-msg-time-info">{formatTime(message.create_time, "time")}</div>
                                    <div className="compact-msg-user-info" onClick={(e) => setMenu({ id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().right, y: e.target.getBoundingClientRect().top })}>
                                        {message.author.display_name ? message.author.display_name : message.author.name}
                                    </div>
                                    <div className="compact-msg-text">{message.content}</div>
                                    {(menu.id === message.id && menu.type === "userCard") &&
                                        createPortal(<UserCard element={menu.element} member={message.author} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />, document.getElementsByClassName("layer")[0])
                                    }
                                </li>
                            ))
                        )
                    }
                    <div className="scroller-spacer"></div>
                </>
                : null
            }
        </div>
    )
}