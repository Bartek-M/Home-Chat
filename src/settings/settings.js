import { useState, useEffect } from "react";
import { version, user_os } from "../functions"

import PageContent from "./components/page_content";
import CardContent from "./components/card_content";


export default function Settings(props) {
    const { user, setUser, friends, setFriends, setSettings } = props

    const [page, setPage] = useState("friends")
    const [card, setCard] = useState(null)

    // Add event listener
    const close_settings = (e) => {
        if (e.key !== "Escape") return
        if (!card) setSettings(false)
        if (card) setCard(null)
    }

    useEffect(() => {
        document.addEventListener("keyup", close_settings)
        return () => { document.removeEventListener("keyup", close_settings) }
    }, [card])

    return (
        <>
            <div className="settings absolute-container">
                <div className="settings-sidebar-wrapper scroller-container" id="settings-dropdown">
                    <nav className="settings-sidebar column-container">
                        <div className="spaced-container">
                            <h2 className="sidebar-title"><a href="/home">Home Chat</a></h2>
                            <button className="center-container" id="settings-dropdown-btn" onClick={() => { document.getElementById("settings-dropdown").classList.toggle("active") }}>
                                <svg width="24" height="24" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                                    <path d="M3.204 11h9.592L8 5.519 3.204 11zm-.753-.659 4.796-5.48a1 1 0 0 1 1.506 0l4.796 5.48c.566.647.106 1.659-.753 1.659H3.204a1 1 0 0 1-.753-1.659z" />
                                </svg>
                            </button>
                        </div>

                        <p className="category-text">USER SETTINGS</p>
                        <button className={page === "account" ? "active" : ""} onClick={() => setPage("account")}>Account</button>
                        <button className={page === "security" ? "active" : ""} onClick={() => setPage("security")}>Security</button>
                        <button className={page === "friends" ? "active" : ""} onClick={() => setPage("friends")}>Friends</button>
                        <hr className="separator" />

                        <p className="category-text">APP SETTINGS</p>
                        <button className={page === "appearance" ? "active" : ""} onClick={() => setPage("appearance")}>Appearance</button>
                        <button className={page === "advanced" ? "active" : ""} onClick={() => setPage("advanced")}>Advanced</button>
                        <hr className="separator" />

                        <a id="settings-logout" href="logout">Log Out</a>
                        <p className="category-text">
                            ver. pre-{version}
                            <br />
                            {user_os}
                        </p>
                    </nav>
                </div>

                <div className="settings-page scroller-container">
                    <div className="column-container" id="settings-content">
                        <PageContent page={page} user={user} setUser={setUser} friends={friends} setFriends={setFriends} card={setCard} />
                    </div>
                    <button onClick={() => { setSettings(false) }} className="center-container" id="close-settings">
                        <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                            <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            {card && (
                <div className="edit-card-wrapper center-container absolute-container">
                    <div className="absolute-container" id="edit-card-overlay"></div>
                    <CardContent card={card} user={user} setUser={setUser} close={setCard} />
                </div>
            )}
        </>
    )
}