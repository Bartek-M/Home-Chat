import { api_send } from "../../api"
import { flash_message } from "../../functions"

// Functions
function set_theme(user, setUser, theme) {
    if (theme === user.theme) return

    setUser({ ...user, theme: theme })
    api_send("user_settings", { settings: `theme='${theme}'` }, user.id).then(() => flash_message("Theme saved!")) // Send to API
}

function set_message_display(user, setUser, msg_display) {
    if (msg_display === user.message_display) return

    setUser({ ...user, message_display: msg_display })
    api_send("user_settings", { settings: `message_display='${msg_display}'` }, user.id).then(() => flash_message("Message display saved!")) // Send to API
}

// Render
export default function Appearance({ props }) {
    const { user, setUser } = props

    return (
        <>
            <h2 className="settings-title">Appearance</h2>
            <div className="column-container">
                <p className="category-text">THEME</p>
                <button className={`settings-full-btn container ${user.theme === "dark" ? "active" : ""}`} onClick={() => set_theme(user, setUser, "dark")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.theme === "dark" ? "active" : ""}`}></div></div>
                    Dark
                </button>
                <button className={`settings-full-btn container ${user.theme === "light" ? "active" : ""}`} onClick={() => set_theme(user, setUser, "light")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.theme === "light" ? "active" : ""}`}></div></div>
                    Light
                </button>
                <button className={`settings-full-btn container ${user.theme === "auto" ? "active" : ""}`} onClick={() => set_theme(user, setUser, "auto")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.theme === "auto" ? "active" : ""}`}></div></div>
                    Auto
                </button>
            </div>
            <hr className="separator" />
            <div className="column-container">
                <p className="category-text">MESSAGE DISPLAY</p>
                <button className={`settings-full-btn container ${user.message_display === "standard" ? "active" : ""}`} onClick={() => set_message_display(user, setUser, "standard")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.message_display === "standard" ? "active" : ""}`}></div></div>
                    Standard
                </button>
                <button className={`settings-full-btn container ${user.message_display === "compact" ? "active" : ""}`} onClick={() => set_message_display(user, setUser, "compact")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.message_display === "compact" ? "active" : ""}`}></div></div>
                    Compact
                </button>
            </div>
        </>
    )
}