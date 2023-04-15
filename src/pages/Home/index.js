import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"

import { api_get, app_theme, prefered_theme, flash_message } from "../../utils/";

import Settings from "../Settings/";
import { Loading } from "../../components/"

export default function Home() {
    const [settings, setSettings] = useState(false)
    const navigator = useNavigate()

    const [user, setUser] = useState(null)

    const [friends, setFriends] = useState(null)
    const [channels, setChannels] = useState(null)

    // Get user
    useEffect(() => {
        if (user) return

        api_get("user_settings", "@me").then(usr => {
            if (usr.message === "401 Unauthorized") { navigator("/login"); return flash_message("Not logged in!", "error") }
            if (usr.message === "403 Forbidden") { navigator("/login"); return flash_message("Logged out!", "error") }
            if (!usr.id) return

            setUser(usr)
            if (localStorage.getItem("email") !== usr.email) localStorage.setItem("email", usr.email)

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

        api_get("user_channels", "@me").then(channels => {
            console.log(channels)
        })

        api_get("user_friends", "@me").then(friends => {
            console.log(friends)
        })
    }, [])

    // Set theme when it changes
    useEffect(() => {
        if (!user) return
        app_theme(user.theme)

        if (user.theme === "auto") {
            let theme_match = window.matchMedia("(prefers-color-scheme: dark)")

            theme_match.addEventListener("change", prefered_theme)
            return () => { theme_match.removeEventListener("change", prefered_theme) }
        }
    }, [user])


    // Render
    return (
        <>
            <Loading />
            {user && <>
                <div className="home-page container">
                    <nav className="main-sidebar spaced-column-container scroller-container">
                        <div className="main-sidebar-elements center-column-container">
                        </div>
                        <div className="main-sidebar-elements center-column-container">
                            <hr className="separator" />
                            <li className="main-sidebar-item center-container">
                                <div className="main-sidebar-pill" id="channel-pill-addchannel"></div>
                                <button className="main-sidebar-icon center-container" onClick={() => { console.log("Open channel creator") }}>
                                    <svg width="32" height="32" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                    </svg>
                                </button>
                            </li>
                            <li className="main-sidebar-item center-container">
                                <div className="main-sidebar-pill" id="channel-pill-settings"></div>
                                <button className="main-sidebar-icon center-container" onClick={() => { setSettings(true) }}>
                                    <svg width="24" height="24" viewBox="0 0 16 16">
                                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                                    </svg>
                                </button>
                            </li>
                        </div>
                    </nav>

                    <div className="main-view spaced-column-container">
                        <div className="not-found center-column-container">
                            <h2 className="not-found-error">404</h2>
                            <h2 className="not-found-text">Open any channel and start chatting</h2>
                        </div>
                    </div>
                </div>
                {settings && (<Settings user={user} setUser={setUser} friends={friends} setFriends={setFriends} setSettings={setSettings} />)}
            </>}
        </>
    )
}