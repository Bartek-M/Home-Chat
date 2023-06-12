import { useState, useMemo, useRef } from "react"

import { useUser, useFriends, useChannels, useFlash } from "../../../context"
import { apiSend, apiFile, openChannel } from "../../../utils"
import { Tooltip } from "../../../components"

// Functions 
function setImage(file, icon) {
    const user_file = file.files[0]
    if (!user_file) return

    icon.src = URL.createObjectURL(user_file)
}

function set_channels(setChannels, channel, icon = null) {
    setChannels(channels => {
        if (channels.some(({ id }) => id === channel.id)) return channels
        channels.unshift(channel)

        return channels.filter(fltr_channel => {
            if (fltr_channel.active) fltr_channel.active = false

            if (fltr_channel.id === channel.id) fltr_channel.active = true
            if (icon && fltr_channel.id === channel.id) fltr_channel.icon = icon

            return fltr_channel
        })
    })
}

function createChannel(button, name, users, icon, img_file, setChannels, close, setFlash) {
    if (!name.value || !users || !icon) return

    apiSend(button, "channelCreate", {
        name: name.value,
        users: users
    }, "POST").then(res => {
        if (res.message === "429 Too Many Requests") return setFlash("Too many requests", "error")

        if (res.errors) {
            if (res.errors.users) setFlash(res.errors.users, "error")
            document.getElementById("name-error").innerText = res.errors.name ? res.errors.name : "*"
            return
        }

        if (res.message == "200 OK" && res.channel.id) {
            const user_file = img_file.files[0]
            if (user_file && !icon.src.includes("/api/images/channels/generic.webp")) {
                const form_data = new FormData()
                form_data.append("image", user_file, "untitled.jpg")

                apiFile("icon", form_data, res.channel.id).then(img_res => {
                    if (img_res.message === "429 Too Many Requests") return setFlash("Too many requests", "error")

                    if (img_res.errors) {
                        if (img_res.errors.image) setFlash(res.errors.image, "error")
                        if (img_res.errors.channel) setFlash(res.errors.channel, "error")

                        return set_channels(setChannels, img_res.channel)
                    }

                    if (img_res.message === "200 OK" && img_res.image) return set_channels(setChannels, res.channel, img_res.image)

                    setFlash("Something went wrong!", "error")
                    set_channels(setChannels, res.channel)
                })
            } else set_channels(setChannels, res.channel)

            window.history.replaceState(null, "", `/channels/${res.channel.id}`)
            return close()
        }

        setFlash("Something went wrong!", "error")
    })
}

export function ChannelCreator({ props }) {
    const { close } = props
    const [page, setPage] = useState("direct")

    const [query, setQuery] = useState("")
    const [selected, setSelected] = useState([])

    const [user,] = useUser()
    const [friends,] = useFriends()
    const [, setChannels] = useChannels()
    const setFlash = useFlash()

    const file_input = useRef()
    const channel_name = useRef()
    const channel_icon = useRef()

    const filteredItems = useMemo(() => {
        if (!friends || !friends.accepted) return []

        return friends.accepted.filter(friend => {
            if (page === "group") return friend.name.toLowerCase().includes(query.toLowerCase()) && !selected.includes(friend.id)
            return friend.name.toLowerCase().includes(query.toLowerCase())
        })
    }, [friends, selected, query, page])

    const selectedItems = useMemo(() => {
        if (!friends || !friends.accepted) return []

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
                {page === "group"
                    ? <div className="column-container">
                        <div className="spaced-container">
                            <div className="avatar-wrapper center-container" onClick={() => file_input.current.click()}>
                                <img className="settings-avatar" ref={channel_icon} src={"/api/images/channels/generic.webp"} onError={(e) => e.target.src = "/api/images/channels/generic.webp"} />
                                <div className="change-icon center-container absolute-container">
                                    CHANGE<br />ICON
                                    <input ref={file_input} type="file" accept="image/*" onChange={() => setImage(file_input.current, channel_icon.current)} />
                                </div>
                                <div className="add-avatar-icon">
                                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="column-container">
                                <p className="category-text">GROUP NAME <span className="error-category-name" id="name-error">*</span></p>
                                <input className="input-field small-card-field" autoFocus spellCheck={false} defaultValue="Untitled" ref={channel_name} maxLength={50} required />
                            </div>
                        </div>
                        <div className="added-users-wrapper container">
                            <p className="category-text">USERS: </p>
                            <div className="added-users-list container">
                                <Tooltip text={user.name} note={user.display_name ? user.display_name : null} type="top">
                                    <button className="user-icon-wrapper center-container">
                                        <img className="added-user-icon" src={`/api/images/${user.avatar}.webp`} />
                                    </button>
                                </Tooltip>
                                <>
                                    {selectedItems.map(friend => (
                                        <Tooltip text={friend.name} note={friend.display_name ? friend.display_name : null} type="top" key={`selected-${friend.id}`}>
                                            <button className="user-icon-wrapper center-container" key={`selected-${friend.id}`} onClick={() =>
                                                setSelected(current => { return current.filter(frnd => frnd != friend.id) })
                                            }>
                                                <img className="added-user-icon" src={`/api/images/${friend.avatar}.webp`} />
                                            </button>
                                        </Tooltip>
                                    ))}
                                </>
                            </div>
                        </div>
                        <div className="column-container">
                            <p className="category-text">SEARCH</p>
                            <div className="friend-search-wrapper small-search spaced-container">
                                <input className="friend-search-input" onChange={(e) => { setQuery(e.target.value) }} />
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                            </div>
                            <div className="friends-wrapper column-container scroller-container">
                                {filteredItems.map(friend => (
                                    <div className="small-card friend-card container" key={`filtered-${friend.id}`} onClick={() =>
                                        setSelected(current => { return (current.includes(friend.id) ? current.filter(frnd => frnd != friend.id) : [...current, friend.id]) })
                                    }>
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
                        </div>
                        <div className="card-submit-wrapper">
                            <button className="card-cancel-btn" onClick={() => close()}>Cancel</button>
                            <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault(); createChannel(e.target, channel_name.current, selected, channel_icon.current, file_input.current, setChannels, close, setFlash) }} value="Create" />
                        </div>
                    </div>
                    : <div className="column-container">
                        <p className="category-text">SEARCH</p>
                        <div className="friend-search-wrapper small-search spaced-container">
                            <input className="friend-search-input" onChange={(e) => { setQuery(e.target.value) }} />
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                        </div>
                        <div className="friends-wrapper column-container scroller-container">
                            {filteredItems.map(friend => (
                                <div className="small-card friend-card container" key={`filtered-${friend.id}`} onClick={(e) => openChannel(e.target, friend.id, setChannels, close, setFlash)}>
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
                    </div>
                }
            </div>
        </div>
    )
}