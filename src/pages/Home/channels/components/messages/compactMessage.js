import { createPortal } from "react-dom"
import { useActive, useUser } from "../../../../../context"

import { formatMessage, formatTime } from "../../../../../utils"
import { UserCard } from "../../../../../components"
import { MessageOptions } from "./"

export function CompactMessage({ message, menu, setMenu, close }) {
    const [user,] = useUser()
    const [active,] = useActive()
    const channel = active.channel

    var author = channel.users[message.author] ? channel.users[message.author] : {}
    if (message.author === user.id) author = { ...author, ...user }

    return (
        <li className="compact-msg container">
            <div className="compact-msg-time-info">{formatTime(message.create_time, "time")}</div>
            <div
                className={author.name ? "compact-msg-user-info short-text" : "compact-msg-user-info compact-msg-dim-name short-text"}
                onClick={(e) => setMenu({
                    id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().left, y: e.target.getBoundingClientRect().top
                })}
            >
                {(author.display_name || author.nick) ? (author.nick || author.display_name) : (author.name || "Unknown")}
            </div>
            <div className="compact-msg-text">{formatMessage(message.content)}</div>
             <MessageOptions message={message} setCard={close} />
            {(menu.id === message.id && menu.type === "userCard") &&
                createPortal(
                    <UserCard element={menu.element} member={author.id ? author : { id: message.author }} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />,
                    document.getElementsByClassName("layer")[0]
                )
            }
        </li>
    )
}