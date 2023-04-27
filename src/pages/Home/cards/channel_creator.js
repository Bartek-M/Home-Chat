import { useState, useMemo, useRef  } from "react"

import { useUser, useFriends, useChannels } from "../../../context"
import { api_send, open_channel, format_time, flash_message } from "../../../utils"

// Functions 
function set_image(file, icon) {
    const user_file = file.files[0]
    if (!user_file) return

    icon.src = URL.createObjectURL(user_file)
}

function create_channel(name, users, icon, setChannels, close) {
    if (!name.value || !users || !icon) return

    api_send("channel_create", {
        name: name.value,
        users: users
    }, "POST").then(res => {
        console.log(res)
        
        if (res.message == "200 OK") {
            setChannels(channels => {
                if (!channels.some(({id}) => id === res.channel.id)) channels.push(res.channel)
                return channels
            })

            return close()
        }

        flash_message("Something went wrong!", "error")
    })
    // if (!icon.src.includes("/api/images/channels/generic.webp")) console.log(icon.src)
}

export function ChannelCreator({ props }) {
    const { close } = props
    const [page, setPage] = useState("direct")

    const [query, setQuery] = useState("")  
    const [selected, setSelected] = useState([])

    const [user, setUser] = useUser()
    const [friends, setFriends] = useFriends()
    const [channels, setChannels] = useChannels()

    const file_input = useRef()
    const channel_name = useRef()
    const channel_icon = useRef()

    const filteredItems = useMemo(() => {
        if (!friends || !friends.accepted) return

        return friends.accepted.filter(friend => {
            if (page === "group") return friend.name.toLowerCase().includes(query.toLowerCase()) && !selected.includes(friend.id)
            return friend.name.toLowerCase().includes(query.toLowerCase())
        })
    }, [friends, selected, query, page])

    const selectedItems = useMemo(() => {
        if (!friends || !friends.accepted) return

        return friends.accepted.filter(friend => {
            return selected.includes(friend.id)
        })
    }, [friends, selected])

    return (
        <div className="settings-edit-card center-column-container">
            <div className="column-container">
                <h2>Channel Creator</h2>
                <button className="card-close center-container" onClick={() => close()}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <div className="creator-tabs-wrapper center-container">
                <button className={`switch-btn ${page === "direct" ? "active" : ""}`} onClick={() => setPage("direct")}>DIRECT</button>
                <button className={`switch-btn ${page === "group" ? "active" : ""}`} onClick={() => setPage("group")}>GROUP</button>
            </div>
            <div className="channel-creator center-container">
                { page === "group"
                    ? <div className="column-container">
                        <div className="spaced-container">
                            <div className="avatar-wrapper center-container" onClick={() => file_input.current.click()}>
                                <img className="settings-avatar" ref={channel_icon} src={"/api/images/channels/generic.webp"} onError={(e) => e.target.src = "/api/images/channels/generic.webp"} />
                                <div className="change-icon center-container absolute-container">
                                    CHANGE<br />ICON
                                    <input ref={file_input} type="file" accept="image/*" onChange={() => set_image(file_input.current, channel_icon.current)} />
                                </div>
                                <div className="add-avatar-icon">
                                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="column-container">
                                <p className="category-text">GROUP NAME <span className="error-category-name" id="code-error">*</span></p>
                                <input className="input-field small-card-field" autoFocus spellCheck={false} defaultValue="Untitled" ref={channel_name} maxLength={50} required />
                            </div>
                        </div>
                        <div className="added-users-wrapper container">
                            <p className="category-text">USERS: </p>
                            <button className="user-icon-wrapper center-container">
                                <div className="tooltip-top">{`${user.name}#${user.tag}`}</div>
                                <img className="added-user-icon" src={`/api/images/${user.avatar}.webp`}/>
                            </button>
                            <>
                                {selectedItems.map(friend => (
                                    <button className="user-icon-wrapper center-container" key={`selected-${friend.id}`} onClick={() => 
                                        setSelected(current => { return current.filter(frnd => frnd != friend.id) }) 
                                    }>
                                        <div className="tooltip-top">{`${friend.name}#${friend.tag}`}</div>
                                        <img className="added-user-icon" src={`/api/images/${friend.avatar}.webp`}/>
                                    </button>
                                )) }
                            </>
                        </div>
                        <div className="column-container">
                            <p className="category-text">SEARCH</p>
                            <div className="friend-search-wrapper small-search spaced-container">
                                <input className="friend-search-input" autoFocus onChange={(e) => { setQuery(e.target.value) }} />
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                            </div>    
                            <div className="friends-wrapper column-container scroller-container">                  
                                {filteredItems.map(friend => (
                                    <div className="small-card friend-card container" key={`filtered-${friend.id}`} onClick={() => 
                                        setSelected(current => { return (current.includes(friend.id) ? current.filter(frnd => frnd != friend.id) : [...current, friend.id] ) }) 
                                    }>
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
                        <div className="card-submit-wrapper">
                            <button className="card-cancel-btn" onClick={() => close()}>Cancel</button>
                            <input className="card-submit-btn submit-btn" type="submit" onClick={() => create_channel(channel_name.current, selected, channel_icon.current, setChannels, close)} value="Create" />
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
        </div>
    )
}