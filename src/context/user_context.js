import React, { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { api_get, app_theme, prefered_theme, flash_message } from "../utils/";
import { Loading } from "../components/"

const UserContext = React.createContext()
export function useUser() { return useContext(UserContext) }

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const navigator = useNavigate()

    useEffect(() => {
        if (user) return

        api_get("user_settings", "@me").then(res => {
            if (res.message === "401 Unauthorized") { navigator("/login"); return flash_message("Not logged in!", "error") }
            if (res.message === "403 Forbidden") { navigator("/login"); return flash_message("Logged out!", "error") }
            if (!res.user || !res.user.id) return

            setUser(res.user)
            if (localStorage.getItem("email") !== res.user.email) localStorage.setItem("email", res.user.email)

            setTimeout(() => {
                const loading_screen_wrapper = document.getElementById("loading-screen-wrapper")
                if (!loading_screen_wrapper) return

                loading_screen_wrapper.classList.add("deactive")
                setTimeout(() => { 
                    if (!loading_screen_wrapper) return
                    loading_screen_wrapper.innerHTML = null; 
                    loading_screen_wrapper.remove() 
                }, 170)
            }, 250)
        })
    })

    useEffect(() => {
        if (!user) return
        app_theme(user.theme)

        if (user.theme === "auto") {
            let theme_match = window.matchMedia("(prefers-color-scheme: dark)")

            theme_match.addEventListener("change", prefered_theme)
            return () => { theme_match.removeEventListener("change", prefered_theme) }
        }
    }, [user])

    return (
        <div id="home-view">
            <Loading />
            {user && 
                <UserContext.Provider value={[user, setUser]}>
                    {children}
                </UserContext.Provider>
            }
        </div>
    )
}