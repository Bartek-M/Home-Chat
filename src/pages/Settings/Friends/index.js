import { useRef, useState } from "react"
import { api_send, flash_message, format_time } from "../../../utils"

function search_user(username, setSearchUser) {
    if (!username.value) return

    var username = username.value.split("#")
    if (username.length != 2) return

    api_send("user_search", {
        username: username[0],
        tag: username[1]
    }).then(res => {
        if (res.message == "200 OK") return setSearchUser(res.user)

        flash_message("User not found", "error")
    })
}

function manage_friends(friend, action) {
    if (!friend || !action) return

    api_send("user_manage_friend", {
        friend: friend,
        action: action
    }, "@me").then(res => {
        console.log(res)
    })
}

export default function Friends({ props }) {
    const { user } = props

    const [searchUser, setSearchUser] = useState(null)
    const user_search = useRef()

    return (
        <>
            <h2 className="settings-title">Friends</h2>
            <form className="column-container" onSubmit={(e) => { e.preventDefault(); search_user(user_search.current, setSearchUser) }}>
                <p className="category-text">SEARCH</p>
                <div className="friends-search-wrapper spaced-container input-field">
                    <input ref={user_search} onChange={(e) => {
                        if (!searchUser || e.target.value === `${searchUser.name}#${searchUser.tag}`) return
                        setSearchUser(null)
                    }} />
                    <button type="submit">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                    </button>
                </div>

                {searchUser && (
                    <>
                        <div className="column-container">
                            <div className="friend-card spaced-container">
                                <div className="center-container">
                                    <img className="friend-icon" src={`/api/images/${searchUser.avatar}.webp`} />
                                    <div className="column-container">
                                        <p>{searchUser.name}<span className="user-tag">#{searchUser.tag}</span></p>
                                        <p className="message-time">{format_time(searchUser.create_time, "date")}</p>
                                    </div>
                                </div>
                                <div className="center-container">
                                    {!searchUser.accepted && (
                                        <button className="add-friend-btn center-container">
                                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                            </svg>
                                        </button>
                                    )}
                                    {(searchUser.accepted && searchUser.accepted !== "waiting") && (
                                        <>
                                            <button className="message-friend-btn center-container">
                                                <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                    <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                                                </svg>
                                            </button>
                                            <button className="remove-friend-btn center-container">
                                                <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                    {searchUser.accepted === "waiting" && (
                                        <button className="confirm-friend-btn center-container">
                                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                                <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-3.5-2a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5Zm0 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <hr className="separator" />
                    </>
                )}
            </form>
            <div className="column-container">
                <p className="extended-category-text">PENDING REQUESTS</p>
                <div className="friend-card spaced-container">
                    <div className="center-container">
                        <img className="friend-icon" src={`/api/images/${user.avatar}.webp`} />
                        <div className="column-container">
                            <p>Bartek<span className="user-tag">#8634</span></p>
                            <p className="message-time">07/04/2023</p>
                        </div>
                    </div>
                    <div className="center-container">
                        <button className="confirm-friend-btn center-container">
                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-3.5-2a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5Zm0 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="friend-card spaced-container">
                    <div className="center-container">
                        <img className="friend-icon" src={`/api/images/${user.avatar}.webp`} />
                        <div className="column-container">
                            <p>Bartek<span className="user-tag">#8634</span></p>
                            <p className="message-time">07/04/2023</p>
                        </div>
                    </div>
                    <div className="center-container">
                        <button className="confirm-friend-btn center-container">
                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-3.5-2a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5Zm0 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <hr className="separator" />
            <div className="column-container">
                <p className="extended-category-text">ALL FRIENDS</p>
                <div className="friend-card spaced-container">
                    <div className="center-container">
                        <img className="friend-icon" src={`/api/images/${user.avatar}.webp`} />
                        <div className="column-container">
                            <p>Bartek<span className="user-tag">#8634</span></p>
                            <p className="message-time">07/04/2023</p>
                        </div>
                    </div>
                    <div className="center-container">
                        <button className="message-friend-btn center-container">
                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                            </svg>
                        </button>
                        <button className="remove-friend-btn center-container">
                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="friend-card spaced-container">
                    <div className="center-container">
                        <img className="friend-icon" src={`/api/images/${user.avatar}.webp`} />
                        <div className="column-container">
                            <p>Bartek<span className="user-tag">#8634</span></p>
                            <p className="message-time">07/04/2023</p>
                        </div>
                    </div>
                    <div className="center-container">
                        <button className="message-friend-btn center-container">
                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                            </svg>
                        </button>
                        <button className="remove-friend-btn center-container">
                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}