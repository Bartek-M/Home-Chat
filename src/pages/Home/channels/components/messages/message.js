import { useActive, useUser } from "../../../../../context"
import { createPortal } from "react-dom"

import { formatMessage, formatTime } from "../../../../../utils"
import { UserCard } from "../../../../../components"
import { MessageOptions } from "./"

export function Message({ message, menu, setMenu, close, index }) {
    const [user,] = useUser()
    const [active,] = useActive()
    const channel = active.channel

    var author = channel.users[message.author] ? channel.users[message.author] : {}
    if (message.author === user.id) author = { ...author, ...user }

    if (channel.messages[index - 1] && channel.messages[index - 1].author === message.author && (message.create_time - channel.messages[index - 1].create_time) < 360) {
        return (
            <li className={`message-list-item repeated-message-list-item container ${active.message && active.message.id === message.id ? "active" : ""}`}>
                <div className="message-hidden-time center-container">{formatTime(message.create_time, "time")}</div>
                <div className="message-content">
                    <div className="message-text">{formatMessage(message.content)}</div>
                    {(message.edited) ? <span className="text-note">(edited)</span> : null}
                </div>
                <MessageOptions message={message} setCard={close} />
            </li>
        )
    }

    return (
        <li className={`message-list-item container ${active.message && active.message.id === message.id ? "active" : ""}`}>
            <img
                className="avatar skeleton"
                draggable={false}
                src={`/api/images/${author.avatar}.webp`}
                onClick={(e) => setMenu(
                    { id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().right, y: e.target.getBoundingClientRect().top }
                )}
                onLoad={(e) => e.target.classList.remove("skeleton")}
            />
            <div className="message-content">
                <div className="message-info container">
                    <p className={author.name ? "message-author short-text" : "message-dim-text short-text"}>
                        {(author.display_name || author.nick) ? (author.nick || author.display_name) : (author.name || "Unknown")}
                    </p>
                    <p className="message-dim-text">{formatTime(message.create_time)}</p>
                </div>
                <div className="message-text">{formatMessage(message.content)}</div>
                {(message.edited) ? <span className="text-note">(edited)</span> : null}
            </div>
            <MessageOptions message={message} setCard={close} />
            {(menu.id === message.id && menu.type === "userCard") &&
                createPortal(
                    <UserCard element={menu.element} member={author.id ? author : { id: message.author }} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />
                    , document.getElementsByClassName("layer")[0]
                )
            }
        </li>
    )
}