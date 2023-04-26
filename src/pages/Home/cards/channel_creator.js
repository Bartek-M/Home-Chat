import { useState, useMemo  } from "react"

import { useFriends, useChannels } from "../../../context"
import { open_channel, format_time } from "../../../utils"

export function ChannelCreator({ props }) {
    const { close } = props
    const [page, setPage] = useState("direct")

    const [query, setQuery] = useState("")
    const [friends, setFriends] = useFriends()
    const [channels, setChannels] = useChannels()

    const filteredItems = useMemo(() => {
        if (!friends || !friends.accepted) return

        return friends.accepted.filter(friend => {
            return friend.name.toLowerCase().includes(query.toLowerCase())
        })
    }, [friends, query])

    return (
        <form className="settings-edit-card center-column-container">
            <div className="column-container">
                <h2>Channel Creator</h2>
                <button className="card-close center-container" type="button" onClick={() => close()}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <div className="creator-tabs-wrapper center-container">
                <button className={`switch-btn ${page === "direct" ? "active" : ""}`} type="button" onClick={() => setPage("direct")}>DIRECT</button>
                <button className={`switch-btn ${page === "group" ? "active" : ""}`} type="button" onClick={() => setPage("group")}>GROUP</button>
            </div>
            <div className="channel-creator center-container">
                { page === "group"
                    ? <div className="column-container">
                        <p>GROUP CREATOR - work in progress</p>
                        <div className="card-submit-wrapper">
                            <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                            <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault() }} value="Create" />
                        </div>
                    </div>
                    : <div className="column-container">
                            <p className="category-text">SEARCH</p>
                            <div className="friend-search-wrapper small-search spaced-container">
                                <input className="friend-search-input" autoFocus onChange={(e) => { setQuery(e.target.value) }} />
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                            </div>    
                            <div className="friends-wrapper column-container scroller-container">                  
                                {filteredItems.map(friend => (
                                    <div className="small-card friend-card container" key={`filtered-${friend.id}`} onClick={() => open_channel(friend.id, setChannels, close)}>
                                        <div className="center-container">
                                            <img className="friend-icon" src={`/api/images/${friend.avatar}.webp`} />
                                            <div className="column-container">
                                                <p>{friend.name}<span className="user-tag">#{friend.tag}</span></p>
                                                <p className="message-time">From: {format_time(friend.accepted, "date")}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="scroller-spacer"></div>
                            </div>
                        </div>
                }
            </div>
        </form>
    )
}