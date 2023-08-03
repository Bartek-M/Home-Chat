import { useMemo, useRef, useState } from "react"
import { useFlash, useFriends } from "../../../context"

import { apiSend } from "../../../utils"
import { FriendCard } from "./friendCard"

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

    const [friends,] = useFriends()
    const setFlash = useFlash()

    const [searchUser, setSearchUser] = useState(null)
    const userSearch = useRef()

    const sortedPending = useMemo(() => {
        if (!friends.pending || !Object.keys(friends.pending).length) return []

        return Object.values(friends.pending).sort((a, b) => {
            if ((a.display_name || a.name) < (b.display_name || b.name)) return -1
            if ((a.display_name || a.name) > (b.display_name || b.name)) return 1
            return 0
        })
    }, [friends.pending ? Object.keys(friends.pending).length : friends.pending])

    const sortedAccepted = useMemo(() => {
        if (!friends.accepted || !Object.keys(friends.accepted).length) return []

        return Object.values(friends.accepted).sort((a, b) => {
            if ((a.display_name || a.name) < (b.display_name || b.name)) return -1
            if ((a.display_name || a.name) > (b.display_name || b.name)) return 1
            return 0
        })
    }, [friends.accepted ? Object.keys(friends.accepted).length : friends.accepted])

    return (
        <>
            <h2 className="settings-title">Friends</h2>
            <div>
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
                        <FriendCard friend={searchUser} card={card} setSettings={setSettings} />
                        <hr className="separator" />
                    </div>
                )}
            </div >
            {sortedPending.length ?
                <div className="column-container">
                    <p className="extended-category-text">PENDING REQUESTS</p>
                    {sortedPending.map(friend => <FriendCard friend={friend} card={card} setSettings={setSettings} key={`pending-${friend.id}`} />)}
                    <hr className="separator" />
                </div> : null
            }
            {sortedAccepted.length ?
                <div className="column-container">
                    <p className="extended-category-text">ALL FRIENDS</p>
                    {sortedAccepted.map(friend => <FriendCard friend={friend} card={card} setSettings={setSettings} key={`accepted-${friend.id}`} />)}
                </div> : null
            }
        </>
    )
}