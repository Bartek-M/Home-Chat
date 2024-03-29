import { useState, useMemo } from "react"
import { useActive, useFlash, useFriends } from "../../../../context"

import { apiSend } from "../../../../utils"

function inviteFriend(button, channel_id, friend, setFlash) {
    apiSend(button, "channelInvite", {
        member: friend.id
    }, "POST", channel_id).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")
            if (res.errors.member) return setFlash(res.member.channel, "error")
            return setFlash("Something went wrong!", "error")
        }

        if (res.message === "200 OK") return setFlash(`Invited '${friend.name}'`)

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function ChannelInvite({ props }) {
    const { close } = props

    const [friends,] = useFriends()
    const setFlash = useFlash()

    const [active,] = useActive()
    const channel = active.channel

    const [query, setQuery] = useState("")

    const sortedFriends = useMemo(() => {
        if (!friends.accepted || !Object.keys(friends.accepted).length) return []

        return Object.values(friends.accepted).sort((a, b) => {
            if ((a.display_name || a.name) < (b.display_name || b.name)) return -1
            if ((a.display_name || a.name) > (b.display_name || b.name)) return 1
            return 0
        })
    }, [friends.accepted])

    const filteredItems = useMemo(() => {
        if (!sortedFriends.length) return []

        return sortedFriends.filter(friend => {
            return friend.name.toLowerCase().includes(query.toLowerCase()) && !channel.users[friend.id]
        })
    }, [Object.keys(channel.users), sortedFriends, query])

    return (
        <div className="settings-edit-card center-column-container">
            <div className="column-container">
                <h2>Invite Friends</h2>
                <button className="card-close center-container" onClick={() => close()}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <div className="column-container">
                <p className="category-text">SEARCH</p>
                <div className="friend-search-wrapper small-search spaced-container">
                    <input className="friend-search-input" onChange={(e) => { setQuery(e.target.value) }} />
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                </div>
                {filteredItems && filteredItems.length
                    ? <div className="friends-wrapper column-container scroller">
                        {filteredItems.map(friend => (
                            <div className="small-card friend-card user-card spaced-container" key={`filtered-${friend.id}`}>
                                <div className="invite-member-info-wrapper container">
                                    <img className="friend-icon skeleton" src={`/api/images/${friend.avatar}.webp`} onLoad={(e) => e.target.classList.remove("skeleton")} />
                                    <div className="invite-member-name-wrapper column-container">
                                        <p className="short-text">{friend.display_name ? friend.display_name : friend.name}</p>
                                        <p className="text-note">{friend.display_name ? friend.name : ""}</p>
                                    </div>
                                </div>
                                <button className="invite-member-btn" onClick={(e) => inviteFriend(e.target, channel.id, friend, setFlash)}>Invite</button>
                            </div>
                        ))}
                        <div className="scroller-spacer"></div>
                    </div>
                    : <div className="category-text center-container">NO MATCHING FRIENDS</div>
                }
            </div>
        </div>
    )
}