import React, { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { ChannelsProvider, FriendsProvider, ActiveProvider, useFlash, SocketProvider } from "..";

import { apiGet, appTheme, preferredTheme } from "../../utils";
import { Loading } from "../../components"

const UserContext = React.createContext()
export function useUser() { return useContext(UserContext) }

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const setFlash = useFlash()

    const navigator = useNavigate()

    useEffect(() => {
        if (user) return

        apiGet("me").then(res => {
            if (res.message === "401 Unauthorized") { navigator("/login"); return setFlash("Not logged in!", "error") }
            if (res.message === "403 Forbidden") { navigator("/login"); return setFlash("Logged out!", "error") }
            if (!res.user || !res.user.id) return setFlash("Couldn't load user!", "error")

            setUser(res.user)
            if (![res.user.name, res.user.email].includes(localStorage.getItem("userLogin"))) localStorage.setItem("userLogin", res.user.name)
        })
    }, [])

    useEffect(() => {
        if (!user) return
        appTheme(user.theme)

        if (user.theme === "auto") {
            let theme_match = window.matchMedia("(prefers-color-scheme: dark)")

            theme_match.addEventListener("change", preferredTheme)
            return () => { theme_match.removeEventListener("change", preferredTheme) }
        }
    }, [user])

    return (
        <div id="home-view">
            <Loading />
            {user &&
                <UserContext.Provider value={[user, setUser]}>
                    <SocketProvider>
                        <ChannelsProvider>
                            <FriendsProvider>
                                <ActiveProvider>
                                    {children}
                                </ActiveProvider>
                            </FriendsProvider>
                        </ChannelsProvider>
                    </SocketProvider>
                </UserContext.Provider>
            }
        </div>
    )
}