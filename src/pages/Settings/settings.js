import { useRef, useState } from "react";
import { useFriends, useUser } from "../../context";

import { version, userOS } from "../../utils/"
import Page from "./pageContent"

export function Settings({ setSettings, setCard }) {
    const [page, setPage] = useState("account")
    const settingsDropdown = useRef()

    const [user,] = useUser()
    const [friends,] = useFriends()

    return (
        <>
            <div className="settings absolute-container">
                <div className="settings-sidebar-wrapper container scroller" ref={settingsDropdown}>
                    <nav className="settings-sidebar column-container">
                        <div className="spaced-container">
                            <h2 className="sidebar-title"><a href="/home">Home Chat</a></h2>
                            <button className="center-container" id="settings-dropdown-btn" onClick={() => { settingsDropdown.current.classList.toggle("active") }}>
                                <svg width="24" height="24" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                                    <path d="M3.204 11h9.592L8 5.519 3.204 11zm-.753-.659 4.796-5.48a1 1 0 0 1 1.506 0l4.796 5.48c.566.647.106 1.659-.753 1.659H3.204a1 1 0 0 1-.753-1.659z" />
                                </svg>
                            </button>
                        </div>

                        <p className="category-text">USER SETTINGS</p>
                        <button className={page === "account" ? "active" : ""} onClick={() => setPage("account")}>Account</button>
                        <button className={page === "security" ? "active" : ""} onClick={() => setPage("security")}>Security</button>
                        <button className={page === "friends" ? "active" : ""} onClick={() => setPage("friends")}>
                            {(user.notifications && user.notifications_friend && friends && friends.pending && Object.keys(friends.pending).length) ? <div className="notification-dot stng-notification-dot"></div> : null}
                            Friends
                        </button>
                        <hr className="separator" />

                        <p className="category-text">APP SETTINGS</p>
                        <button className={page === "appearance" ? "active" : ""} onClick={() => setPage("appearance")}>Appearance</button>
                        <button className={page === "notifications" ? "active" : ""} onClick={() => setPage("notifications")}>Notifications</button>
                        <hr className="separator" />

                        <a className="container leave-btn" id="settings-logout" href="/logout">
                            Log Out
                            <svg width="16" height="16" fill="var(--RED_BUTTON)" viewBox="0 0 16 16">
                                <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                                <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
                            </svg>
                        </a>
                        <p className="category-text small-category-text">
                            ver. pre-{version}
                            <br />
                            {userOS}
                        </p>
                        <div className="scroller-spacer"></div>
                    </nav>
                </div>

                <div className="settings-page container scroller">
                    <div className="settings-content column-container">
                        <Page page={page} card={setCard} setSettings={setSettings} />
                    </div>
                    <button onClick={() => { setSettings(false) }} className="center-container" id="close-settings">
                        <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                            <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </>
    )
}