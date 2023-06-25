import { useState, useMemo } from "react"

import { useFriends, useChannels, useFlash, useActive } from "../../../context"
import { openChannel } from "../../../utils"

export function Direct({ close }) {
    const [friends,] = useFriends()
    const [, setChannels] = useChannels()

    const [, setActive] = useActive()
    const setFlash = useFlash()

    const [query, setQuery] = useState("")

    const filteredItems = useMemo(() => {
        if (!friends || !friends.accepted) return []

        return friends.accepted.filter(friend => {
            return friend.name.toLowerCase().includes(query.toLowerCase())
        })
    }, [friends, query])


    return (
        <div className="column-container">
            <p className="category-text">SEARCH</p>
            <div className="friend-search-wrapper small-search spaced-container">
                <input className="friend-search-input" onChange={(e) => { setQuery(e.target.value) }} />
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
            </div>
            {filteredItems && filteredItems.length
                ? <div className="friends-wrapper column-container scroller-container">
                    {filteredItems.map(friend => (
                        <div className="small-card friend-card container" key={`filtered-${friend.id}`} onClick={(e) => openChannel(e.target, friend.id, setChannels, setActive, close, setFlash)}>
                            <div className="center-container">
                                <img className="friend-icon" src={`/api/images/${friend.avatar}.webp`} />
                                <div className="column-container">
                                    {friend.display_name
                                        ? <p>{friend.display_name}</p>
                                        : <p>{friend.name}</p>
                                    }
                                    <p className="text-note">{friend.display_name ? friend.name : ""}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="scroller-spacer"></div>
                </div>
                : <div className="category-text center-container">NO MATCHING FRIENDS</div>
            }
        </div>
    )
}