import { useState, useMemo   } from "react"

import { useFriends } from "../../../context"
import { format_time } from "../../../utils"

export function ChannelCreator({ props }) {
    const { close } = props
    const [page, setPage] = useState("direct")

    const [query, setQuery] = useState("")
    const [friends, _] = useFriends()

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
                                    <div className="small-card friend-card spaced-container" key={`filtered-${friend.id}`}>
                                        <div className="center-container">
                                            <img className="friend-icon" src={`/api/images/${friend.avatar}.webp`} />
                                            <div className="column-container">
                                                <p>{friend.name}<span className="user-tag">#{friend.tag}</span></p>
                                                <p className="message-time">From: {format_time(friend.accepted, "date")}</p>
                                            </div>
                                        </div>
                                        <button className="message-friend-btn center-container">
                                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                                            </svg>
                                        </button>
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