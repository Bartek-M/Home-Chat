import React, { useState, useContext, useEffect } from "react"
import { api_get } from "../utils/";

const FriendsContext = React.createContext()
export function useFriends() { return useContext(FriendsContext) }

export function FriendsProvider({ children }) {
    const [friends, setFriends] = useState(null)

    useEffect(() => {
        if (friends) return

        api_get("user_friends", "@me").then(res => {
            if (res.message !== "200 OK") return flash_message("Couldn't load friends!", "error")
            setFriends(res.user_friends ? res.user_friends : [])
        })
    })

    return (
        <FriendsContext.Provider value={[friends, setFriends]}>
            {children}
        </FriendsContext.Provider>
    )
}