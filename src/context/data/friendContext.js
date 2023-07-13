import React, { useState, useContext, useEffect } from "react"

import { apiGet } from "../../utils";
import { useFlash, useSocket } from "..";

const FriendsContext = React.createContext()
export function useFriends() { return useContext(FriendsContext) }

export function FriendsProvider({ children }) {
    const [friends, setFriends] = useState(null)
    const setFlash = useFlash()

    const socket = useSocket()

    useEffect(() => {
        const onFriendsChange = (data) => {
            const action = data.action
            const friend = data.friend

            if (!action || !friend) return
            if (!["add", "confirm", "remove"].includes(action)) return

            setFriends((current_friends) => {
                if (action === "add") {
                    if (!current_friends.pending) current_friends.pending = {}
                    if (!current_friends.pending[friend.id]) current_friends.pending[friend.id] = friend
                }

                else if (action === "confirm") {
                    if (current_friends.pending && current_friends.pending[friend.id]) delete current_friends.pending[friend.id]
                    if (!current_friends.accepted) current_friends.accepted = {}
                    current_friends.accepted[friend.id] = friend
                }

                else if (action === "remove") {
                    if (current_friends.accepted && current_friends.accepted[friend]) delete current_friends.accepted[friend]
                    if (current_friends.pending && current_friends.pending[friend]) delete current_friends.pending[friend]
                }
                
                return { ...current_friends }
            })
        }

        socket.on("friends_change", onFriendsChange)
        return () => socket.off("friends_change", onFriendsChange)
    }, [])

    useEffect(() => {
        if (friends) return

        apiGet("userFriends", "@me").then(res => {
            if (res.message !== "200 OK") return setFlash("Couldn't load friends!", "error")
            setFriends(res.user_friends ? res.user_friends : [])
        })
    }, [])

    return (
        <FriendsContext.Provider value={[friends, setFriends]}>
            {children}
        </FriendsContext.Provider>
    )
}