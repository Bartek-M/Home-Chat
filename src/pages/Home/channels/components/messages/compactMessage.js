import { createPortal } from "react-dom"
import { useActive, useFriends, useUser } from "../../../../../context"

import { formatMessage, formatTime } from "../../../../../utils"
import { UserCard } from "../../../../../components"
import { MessageOptions } from "./"

export function CompactMessage({ message, menu, setMenu, close }) {
    const [user,] = useUser()
    const [friends,] = useFriends()

    const [active,] = useActive()
    const channel = active.channel

    const author = useMemo(() => {
        var author = channel.users[message.author] ? channel.users[message.author] : {}

        if (message.author === user.id) author = { ...author, ...user }
        if (!Object.keys(author).length) author = (friends.accepted && friends.accepted[message.author]) ? friends.accepted[message.author] : {}

        return author
    })

    return (
        <li className="compact-msg container">
            <div className="compact-msg-time-info">{formatTime(message.create_time, "time")}</div>
            <div className="compact-msg-user-info-wrapper column-container">
                <div
                    className={author.name ? "compact-msg-user-info short-text" : "compact-msg-user-info compact-msg-dim-name short-text"}
                    onClick={(e) => setMenu({
                        id: message.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().left, y: e.target.getBoundingClientRect().top
                    })}
                >
                    {(author.display_name || author.nick) ? (author.nick || author.display_name) : (author.name || "Unknown")}
                </div>
                {(message.edited) ? <span className="text-note">(edited)</span> : null}
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