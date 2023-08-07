import { useState, useMemo, useRef } from "react"

import { useUser, useFriends, useChannels, useFlash, useActive } from "../../../context"
import { apiSend, apiFile } from "../../../utils"
import { Tooltip } from "../../../components"

// Functions 
function setImage(file, icon) {
    const user_file = file.files[0]
    if (!user_file) return

    icon.src = URL.createObjectURL(user_file)
}

function createChannel(button, name, users, icon, img_file, channels, setActive, close, setFlash) {
    if (!name.value || !users || !icon) return

    apiSend(button, "channelCreate", {
        name: name.value,
        users: users,
        icon: (img_file && img_file.files[0] && !icon.src.includes("/api/images/channels/generic.webp")) ? true : false
    }, "POST").then(res => {
        if (res.errors) {
            if (res.errors.users) setFlash(res.errors.users, "error")
            document.getElementById("name-error").innerText = res.errors.name ? res.errors.name : "*"
            return
        }

        if (res.message == "200 OK" && res.channel.id) {
            if (!img_file || !img_file.files[0] || icon.src.includes("/api/images/channels/generic.webp")) {
                setActive({ channel: channels[res.channel.id] })
                return close()
            }

            const user_file = img_file.files[0]
            const form_data = new FormData()
            form_data.append("image", user_file, "untitled.jpg")

            apiFile(button, "icon", form_data, res.channel.id).then(img_res => {
                if (img_res.errors) {
                    if (img_res.errors.image) setFlash(res.errors.image, "error")
                    if (img_res.errors.channel) setFlash(res.errors.channel, "error")

                    setActive({ channel: channels[res.channel.id] })
                    return close()
                }

                if (img_res.message === "200 OK" && img_res.image) {
                    setActive({ channel: channels[res.channel.id] })
                    return close()
                }

                if (res.message) setFlash(res.message, "error")
                else setFlash("Something went wrong!", "error")

                setActive({ channel: channels[res.channel.id] })
                close()
            })

            return
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function Channel({ close }) {
    const [user,] = useUser()
    const [channels,] = useChannels()
    const [friends,] = useFriends()

    const [, setActive] = useActive()
    const setFlash = useFlash()

    const file_input = useRef()
    const channel_name = useRef()
    const channel_icon = useRef()

    const [query, setQuery] = useState("")
    const [selected, setSelected] = useState([])

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
            return friend.name.toLowerCase().includes(query.toLowerCase()) && !selected.includes(friend.id)
        })
    }, [sortedFriends, selected, query])

    const selectedItems = useMemo(() => {
        if (!sortedFriends.length) return []

        return sortedFriends.filter(friend => {
            return selected.includes(friend.id)
        })
    }, [sortedFriends, selected])

    return (
        <div className="column-container">
            <div className="spaced-container">
                <div className="avatar-wrapper center-container" onClick={() => file_input.current.click()}>
                    <img className="settings-avatar skeleton" ref={channel_icon} src={"/api/images/channels/generic.webp"} onLoad={(e) => e.target.classList.remove("skeleton")} onError={(e) => { if (!e.target.src.includes("/api/images/channels/generic.webp")) e.target.src = "/api/images/channels/generic.webp" }} />
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
                    <p className="category-text">GROUP NAME <span className="error-category-text" id="name-error">*</span></p>
                    <input className="input-field small-card-field" autoFocus spellCheck={false} defaultValue="Untitled" ref={channel_name} maxLength={50} required />
                </div>
            </div>
            <div className="added-users-wrapper container">
                <p className="category-text">USERS: </p>
                <div className="added-users-list container">
                    <Tooltip text={user.name} note={user.display_name ? user.display_name : null} type="top">
                        <button className="user-icon-wrapper center-container">
                            <img className="added-user-icon skeleton" src={`/api/images/${user.avatar}.webp`} onLoad={(e) => e.target.classList.remove("skeleton")} />
                        </button>
                    </Tooltip>
                    <>
                        {selectedItems.map(friend => (
                            <Tooltip text={friend.name} note={friend.display_name ? friend.display_name : null} type="top" key={`selected-${friend.id}`}>
                                <button className="user-icon-wrapper center-container" key={`selected-${friend.id}`} onClick={() =>
                                    setSelected(current => { return current.filter(frnd => frnd != friend.id) })
                                }>
                                    <img className="added-user-icon skeleton" src={`/api/images/${friend.avatar}.webp`} onLoad={(e) => e.target.classList.remove("skeleton")} />
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
                {filteredItems && filteredItems.length
                    ? <div className="friends-wrapper column-container scroller">
                        {filteredItems.map(friend => (
                            <div className="small-card friend-card container" key={`filtered-${friend.id}`} onClick={() =>
                                setSelected(current => { return (current.includes(friend.id) ? current.filter(frnd => frnd != friend.id) : [...current, friend.id]) })
                            }>
                                <div className="member-info-wrapper container">
                                    <img className="friend-icon skeleton" src={`/api/images/${friend.avatar}.webp`} onLoad={(e) => e.target.classList.remove("skeleton")} />
                                    <div className="column-container">
                                        <p className="short-text">{friend.display_name ? friend.display_name : friend.name}</p>
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
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => {
                    e.preventDefault()
                    createChannel(e.target, channel_name.current, selected, channel_icon.current, file_input.current, channels, setActive, close, setFlash)
                }} value="Create" />
            </div>
        </div>
    )
}