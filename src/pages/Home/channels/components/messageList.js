import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useUser } from "../../../../context"

import { formatTime, smoothScroll } from "../../../../utils"
import { UserCard } from "../../../../components"

export function MessageList({ channel, close }) {
    const [user,] = useUser()
    const [menu, setMenu] = useState({ id: null, element: null, type: null, x: 0, y: 0 })

    const message_list = useRef()
    useEffect(() => smoothScroll(message_list.current), [channel ? channel.messages : null])

    return (
        <div className="chat-window column-container scroller-container" ref={message_list}>
            {(channel.messages && channel.messages.length)
                ? <>
                    {user.message_display === "standard"
                        ? (
                            channel.messages.map((message, index) => (
                                (channel.messages[index - 1] && channel.messages[index - 1].author.id === message.author.id && (message.time - channel.messages[index - 1].time) < 360)
                                    ? <li className="message-list-item repeated-message-list-item container" key={message.id}>
                                        <div className="message-hidden-time center-container">{formatTime(message.time, "time")}</div>
                                        <div className="message-content">
                                            <div className="message-text">{message.content}</div>
                                        </div>
                                    </li>
                                    : <li className="message-list-item container" key={message.id}>
                                        <img className="avatar" src={`/api/images/${message.author.avatar}.webp`} onClick={(e) => setMenu({ id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().right, y: e.target.getBoundingClientRect().top })} />
                                        <div className="message-content">
                                            <div className="message-info container">
                                                <p className="message-author">{message.author.display_name ? message.author.display_name : message.author.name}</p>
                                                <p className="message-time">{formatTime(message.time)}</p>
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
                                    <div className="compact-msg-time-info">{formatTime(message.time, "time")}</div>
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