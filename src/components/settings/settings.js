import { useState, useContext } from "react";
import { UserContext, version, user_os, overlay_open, overlay_close } from "../../functions"

import Account from "./pages/account";
import Security from "./pages/security";
import Friends from "./pages/friends";
import Appearance from "./pages/appearance";
import Advanced from "./pages/advanced";

import Username from "./edit_cards/username";
import Email from "./edit_cards/email";

const pages = {
    account: Account,
    security: Security,
    friends: Friends,
    appearance: Appearance,
    advanced: Advanced
}

const cards = {
    username: Username,
    email: Email
}

export default function Settings() {
    const { user, setUser } = useContext(UserContext)

    const [page, setPage] = useState("account")
    const [card, setCard] = useState(null)

    // Pages
    function open_tab(new_page) {
        if (new_page == page) return

        document.getElementById(`${page}-btn`).classList.remove("active")
        document.getElementById(`${new_page}-btn`).classList.add("active")

        setPage(new_page)
    }

    // Cards
    function open_card(new_card) { overlay_open(document.getElementById("settings-edit-card")); setCard(new_card) }
    function close_card() { overlay_close(); setCard(null) }

    return (
        <>
            <div className="absolute-container" id="settings">
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
                        <button className="active" id="account-btn" onClick={() => open_tab("account")}>Account</button>
                        <button id="security-btn" onClick={() => open_tab("security")}>Security</button>
                        <button id="friends-btn" onClick={() => open_tab("friends")}>Friends</button>
                        <hr className="separator" />

                        <p className="category-text">APP SETTINGS</p>
                        <button id="appearance-btn" onClick={() => open_tab("appearance")}>Appearance</button>
                        <button id="advanced-btn" onClick={() => open_tab("advanced")}>Advanced</button>
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
                        {pages[page]({
                            user: user, 
                            setUser: setUser, 
                            open_card: open_card
                        })}
                    </div>
                    <button onClick={() => { document.getElementById("settings").classList.remove("shown") }} className="center-container" id="close-settings">
                        <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                            <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="edit-card-wrapper center-container absolute-container">
                <div className="center-column-container" id="settings-edit-card">
                    {card ? cards[card]({
                        user: user, 
                        setUser: setUser, 
                        close_card: close_card
                    }) : ""}
                </div>
            </div>
        </>
    )
}