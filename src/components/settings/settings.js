import React from "react";
import Account from "./pages/account";

export default function Settings() {
    return (
        <>
            <div className="absolute-container" id="settings">
                <div className="settings-sidebar-wrapper scroller-container" id="settings-dropdown">
                    <nav className="settings-sidebar column-container">
                        <div className="spaced-container">
                            <h2 className="sidebar-title"><a href="/home">Home Chat</a></h2>
                            <button className="center-container" id="settings-dropdown-btn">
                                <svg width="24" height="24" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                                    <path d="M3.204 11h9.592L8 5.519 3.204 11zm-.753-.659 4.796-5.48a1 1 0 0 1 1.506 0l4.796 5.48c.566.647.106 1.659-.753 1.659H3.204a1 1 0 0 1-.753-1.659z" />
                                </svg>
                            </button>
                        </div>

                        <p className="category-text">USER SETTINGS</p>
                        <button id="settings-open-account">Account</button>
                        <button id="settings-open-security">Security</button>
                        <button id="settings-open-friends">Friends</button>
                        <hr className="separator" />

                        <p className="category-text">APP SETTINGS</p>
                        <button id="settings-open-appearance">Appearance</button>
                        <button id="settings-open-advanced">Advanced</button>
                        <hr className="separator" />

                        <a id="settings-logout" href="logout">Log Out</a>
                        <p className="category-text" id="settings-sidebar-info">ver. pre-2f8b849</p>
                    </nav>
                </div>

                <div className="settings-page scroller-container">
                    <div className="column-container" id="settings-content">
                        <Account />
                    </div>
                    <button onClick={() => {document.getElementById("settings").classList.remove("active")}} className="center-container" id="close-settings">
                        <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                            <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="edit-card-wrapper center-container absolute-container">
                <div className="center-column-container" id="settings-edit-card"></div>
            </div>
        </>
    )
}