import { useRef, useEffect } from "react"
import { useUser, useActive, useFlash, useFriends, useChannels } from "../context"

import { formatTime, openChannel, addFriend } from "../utils"

export function UserCard({ element, member, x, y, close, setCard }) {
    const [user,] = useUser()
    const [, setChannels] = useChannels()
    const [active, setActive] = useActive()
    const setFlash = useFlash()

    const [friends, setFriends] = useFriends()
    const accepted_status = friends.accepted ? friends.accepted.find(friend => member.id === friend.id) : null
    const pending_status = friends.pending ? friends.pending.find(friend => member.id === friend.id) : null

    const menu = useRef()

    useEffect(() => {
        const listener = (e) => {
            if (!element || element.contains(e.target) || menu.current.contains(e.target)) return
            close()
        }

        document.addEventListener("click", listener)
        window.addEventListener("resize", close)

        return () => {
            document.removeEventListener("click", listener)
            window.removeEventListener("resize", close)
        }
    }, [])

    return (
        <div className="user-info-card column-container" ref={menu} style={{ top: y + 20, left: x }}>
            <div className="user-info center-container">
                <img className="user-card-avatar" src={`/api/images/${member.avatar}.webp`} />
                <div className="column-container">
                    {(member.nick || member.display_name) && <h3>{member.nick || member.display_name}</h3>}
                    <h3 className={(member.nick || member.display_name || !member.name) ? "username" : ""}>{member.name ? member.name : "Unknown"}</h3>
                </div>
            </div>
            <h5 className="container">ID: <p className="edit-card-info">{member.id ? member.id : "N/A"}</p></h5>
            <h5 className="container">Created at: <p className="edit-card-info">{member.create_time ? formatTime(member.create_time, "date") : "N/A"}</p></h5>
            {(member.id !== user.id && member.name) &&
                <>
                    {(accepted_status && !active.channel.direct) && <button className="user-card-btn" onClick={e => { e.preventDefault(); openChannel(e.target, member.id, setChannels, setActive, setCard, setFlash) }}>Message</button>}
                    {(!pending_status && !accepted_status) && <button className="user-card-btn" onClick={e => { e.preventDefault(); addFriend(e.target, user.id, member, setFriends, setFlash) }}>Add Friend</button>}
                    {pending_status && <button className="user-card-btn" disabled>Pending</button>}
                </>
            }
        </div>
    )
}