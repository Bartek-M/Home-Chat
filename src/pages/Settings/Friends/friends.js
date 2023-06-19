import { useRef, useState } from "react"
import { useActive, useChannels, useFlash, useFriends, useUser } from "../../../context"

import { apiSend, formatTime, openChannel } from "../../../utils"
import { addFriend, removeFriend, confirmFriend, declineFriend } from "./"
import { Tooltip } from "../../../components"

function search_user(button, username, searchUser, setSearchUser, setFlash) {
    if (!username.value) return
    if (searchUser && username.value.toLowerCase() === searchUser.name) return

    apiSend(button, "userSearch", {
        username: username.value,
    }, "POST").then(res => {        
        if (res.errors) return document.getElementById("search-error").innerText = res.errors.username ? `- ${res.errors.username}` : null
        if (res.message == "200 OK" && res.user) return setSearchUser(res.user)

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong", "error")
    })
}

export function Friends({ props }) {
    const { card, setSettings } = props

    const [user,] = useUser()
    const [, setChannels] = useChannels()
    const [friends, setFriends] = useFriends()

    const [, setActive] = useActive()
    const setFlash = useFlash()

    const [searchUser, setSearchUser] = useState(null)
    const userSearch = useRef()

    return (
        <>
            <h2 className="settings-title">Friends</h2>
            <form className="column-container">
                <p className="category-text">SEARCH <span className="error-category-text" id="search-error"></span></p>
                <div className="friend-search-wrapper spaced-container">
                    <input className="friend-search-input" type="text" ref={userSearch} onChange={(e) => {
                        document.getElementById("search-error").innerText = null
                        if (!searchUser || e.target.value === searchUser.name) return
                        setSearchUser(null)
                    }} />
                    <button className="search-submit" type="submit" onClick={e => {
                        e.preventDefault()
                        if (e.target.disabled) return
                        search_user(e.target, userSearch.current, searchUser, setSearchUser, setFlash)
                    }}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                    </button>
                </div>

                {searchUser && (
                    <div className="column-container">
                        <div className={`friend-card ${!searchUser.accepted || searchUser.accepted === "waiting" ? "user-card" : ""} spaced-container`} onClick={(e) => {
                            if (!searchUser.accepted || searchUser.accepted === "waiting") return
                            openChannel(e.target, searchUser.id, setChannels, setActive, card, setSettings, setFlash)
                        }}>
                            <div className="center-container">
                                <img className="friend-icon" src={`/api/images/${searchUser.avatar}.webp`} />
                                <div className="column-container">
                                    {searchUser.display_name
                                        ? <p>{searchUser.display_name}</p>
                                        : <p>{searchUser.name}</p>
                                    }

                                    {(searchUser.accepted && searchUser.accepted !== "waiting")
                                        ? <p className="text-note">{searchUser.display_name ? `${searchUser.name}  |  ` : ""}From: {formatTime(searchUser.accepted, "date")}</p>
                                        : (searchUser.display_name && <p className="text-note">{searchUser.name}</p>)
                                    }
                                </div>
                            </div>
                            <div className="center-container">
                                {!searchUser.accepted && (
                                    <Tooltip text="Add" type="top">
                                        <button className="add-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); addFriend(e.target, user.id, searchUser, setFriends, setFlash) }}>
                                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                            </svg>
                                        </button>
                                    </Tooltip>
                                )}
                                {(searchUser.accepted && searchUser.accepted !== "waiting") && (
                                    <>
                                        <Tooltip text="Message" type="top">
                                            <button className="message-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); openChannel(e.target, searchUser.id, setChannels, setActive, card, setSettings, setFlash) }}>
                                                <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                    <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                                                </svg>
                                            </button>
                                        </Tooltip>
                                        <Tooltip text="Remove" type="top">
                                            <button className="remove-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); removeFriend(e.target, searchUser.id, setFriends, setFlash) }}>
                                                <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                                </svg>
                                            </button>
                                        </Tooltip>
                                    </>
                                )}
                                {searchUser.accepted === "waiting" && (
                                    <>
                                        {searchUser.inviting !== user.id &&
                                            <Tooltip text="Confirm" type="top">
                                                <button className="add-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); confirmFriend(e.target, searchUser, setFriends, setFlash) }}>
                                                    <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                        <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                                    </svg>
                                                </button>
                                            </Tooltip>
                                        }
                                        <Tooltip text="Decline" type="top">
                                            <button className="remove-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); declineFriend(e.target, searchUser.id, setFriends, setFlash) }}>
                                                <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                                </svg>
                                            </button>
                                        </Tooltip>
                                    </>
                                )}
                            </div>
                        </div>
                        <hr className="separator" />
                    </div>
                )}
            </form >
            {(friends && friends.pending && friends.pending.length) ?
                <div className="column-container">
                    <p className="extended-category-text">PENDING REQUESTS</p>
                    {friends.pending.map(friend =>
                        <div className="friend-card user-card spaced-container" key={`pending-${friend.id}`}>
                            <div className="center-container">
                                <img className="friend-icon" src={`/api/images/${friend.avatar}.webp`} />
                                <div className="column-container">
                                    {friend.display_name && <p>{friend.display_name}</p>}
                                    <p className={friend.display_name ? "text-note" : ""}>{friend.name}</p>
                                </div>
                            </div>
                            <div className="center-container">
                                {friend.inviting !== user.id &&
                                    <Tooltip text="Confirm" type="top">
                                        <button className="add-friend-btn center-container" onClick={(e) => { e.stopPropagation(); confirmFriend(e.target, friend, setFriends, setFlash) }}>
                                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                            </svg>
                                        </button>
                                    </Tooltip>
                                }
                                <Tooltip text="Decline" type="top">
                                    <button className="remove-friend-btn center-container" onClick={(e) => { e.stopPropagation(); declineFriend(e.target, friend.id, setFriends, setFlash) }}>
                                        <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    )}
                    <hr className="separator" />
                </div> : null
            }
            {(friends && friends.accepted && friends.accepted.length) ?
                <div className="column-container">
                    <p className="extended-category-text">ALL FRIENDS</p>
                    {friends.accepted.map(friend =>
                        <div className="friend-card spaced-container" key={`accepted-${friend.id}`} onClick={(e) => openChannel(e.target, friend.id, setChannels, setActive, card, setFlash, setSettings)}>
                            <div className="center-container">
                                <img className="friend-icon" src={`/api/images/${friend.avatar}.webp`} />
                                <div className="column-container">
                                    {friend.display_name
                                        ? <p>{friend.display_name}</p>
                                        : <p>{friend.name}</p>
                                    }
                                    <p className="text-note">{friend.display_name ? `${friend.name}  |  ` : ""}From: {formatTime(friend.accepted, "date")}</p>
                                </div>
                            </div>
                            <div className="center-container">
                                <Tooltip text="Message" type="top">
                                    <button className="message-friend-btn center-container" onClick={(e) => { e.stopPropagation(); openChannel(e.target, friend.id, setChannels, setActive, card, setFlash, setSettings) }}>
                                        <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                            <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                                        </svg>
                                    </button>
                                </Tooltip>
                                <Tooltip text="Remove" type="top">
                                    <button className="remove-friend-btn center-container" onClick={(e) => { e.stopPropagation(); removeFriend(e.target, friend.id, setFriends, setFlash) }}>
                                        <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    )
                    }
                </div>
                : null
            }
        </>
    )
}