import React, { useState, useContext, useEffect } from "react"

import { apiGet } from "../../utils";
import { useFlash } from "..";

const FriendsContext = React.createContext()
export function useFriends() { return useContext(FriendsContext) }

export function FriendsProvider({ children }) {
    const [friends, setFriends] = useState(null)
    const setFlash = useFlash()

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