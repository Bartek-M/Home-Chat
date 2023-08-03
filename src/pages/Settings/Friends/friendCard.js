import { useMemo } from "react"
import { useActive, useChannels, useFlash, useUser } from "../../../context"

import { formatTime, openChannel, addFriend } from "../../../utils"
import { removeFriend, confirmFriend, declineFriend } from "./manageFriends"
import { Tooltip } from "../../../components"


export function FriendCard({ friend, card, setSettings }) {
    const [user,] = useUser()
    const [channels,] = useChannels()
    const setFlash = useFlash()

    const [, setActive] = useActive()

    const accepted = useMemo(() => {
        if (friend.accepted && friend.accepted !== "waiting") return 1 // User is a friend
        if (friend.accepted === "waiting") return 2 // User has pending friend request

        return 0 // User is not a friend
    }, [friend.id, friend.accepted])

    return (
        <div className="small-card friend-card spaced-container">
            <div className="member-info-wrapper container">
                <img className="friend-icon skeleton" src={`/api/images/${friend.avatar}.webp`} onLoad={(e) => e.target.classList.remove("skeleton")} />
                <div className="invite-member-name-wrapper column-container">
                    <p className="short-text">{friend.display_name ? friend.display_name : friend.name}</p>
                    {accepted === 1
                        ? <p className="text-note">{friend.display_name ? `${friend.name}  |  ` : ""}From: {formatTime(friend.accepted, "date")}</p>
                        : (friend.display_name && <p className="text-note">{friend.name}</p>)
                    }
                </div>
            </div>
            <div className="center-container">
                {!accepted && (
                    <Tooltip text="Add" type="top">
                        <button className="add-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); addFriend(e.target, friend, setFlash) }}>
                            <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                            </svg>
                        </button>
                    </Tooltip>
                )}
                {accepted === 1 && (
                    <>
                        <Tooltip text="Message" type="top">
                            <button className="message-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); openChannel(e.target, channels, friend.id, setActive, card, setFlash, setSettings) }}>
                                <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                    <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                                </svg>
                            </button>
                        </Tooltip>
                        <Tooltip text="Remove" type="top">
                            <button className="remove-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); removeFriend(e.target, friend.id, setFlash) }}>
                                <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                </svg>
                            </button>
                        </Tooltip>
                    </>
                )}
                {accepted === 2 && (
                    <>
                        {friend.inviting !== user.id &&
                            <Tooltip text="Confirm" type="top">
                                <button className="add-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); confirmFriend(e.target, friend, setFlash) }}>
                                    <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                    </svg>
                                </button>
                            </Tooltip>
                        }
                        <Tooltip text="Decline" type="top">
                            <button className="remove-friend-btn center-container" type="button" onClick={(e) => { e.stopPropagation(); declineFriend(e.target, friend.id, setFlash) }}>
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
    )
}