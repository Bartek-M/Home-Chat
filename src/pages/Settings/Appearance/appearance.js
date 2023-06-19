import { useFlash, useUser } from "../../../context"
import { apiSend } from "../../../utils"

// Functions
function set_theme(button, user, setUser, theme, setFlash) {
    if (theme === user.theme) return

    apiSend(button, "userSettings", {
        category: "theme",
        data: theme
    }, "PATCH", "@me").then(res => {
        if (res.message === "200 OK") {
            setUser((current_user) => { return { ...current_user, theme: theme } })
            return setFlash("Theme saved!")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

function set_message_display(button, user, setUser, msg_display, setFlash) {
    if (msg_display === user.message_display) return

    apiSend(button, "userSettings", {
        category: "message_display",
        data: msg_display
    }, "PATCH", "@me").then(res => {        
        if (res.message === "200 OK") {
            setUser((current_user) => { return { ...current_user, message_display: msg_display } })
            return setFlash("Message display saved!")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

// Render
export function Appearance() {
    const [user, setUser] = useUser()
    const setFlash = useFlash()

    return (
        <>
            <h2 className="settings-title">Appearance</h2>
            <div className="column-container">
                <p className="category-text">THEME</p>
                <button className={`settings-full-btn container ${user.theme === "dark" ? "active" : ""}`} onClick={(e) => set_theme(e.target, user, setUser, "dark", setFlash)}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.theme === "dark" ? "active" : ""}`}></div></div>
                    Dark
                </button>
                <button className={`settings-full-btn container ${user.theme === "light" ? "active" : ""}`} onClick={e => set_theme(e.target, user, setUser, "light", setFlash)}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.theme === "light" ? "active" : ""}`}></div></div>
                    Light
                </button>
                <button className={`settings-full-btn container ${user.theme === "auto" ? "active" : ""}`} onClick={e => set_theme(e.target, user, setUser, "auto", setFlash)}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.theme === "auto" ? "active" : ""}`}></div></div>
                    Auto
                </button>
            </div>
            <hr className="separator" />
            <div className="column-container">
                <p className="category-text">MESSAGE DISPLAY</p>
                <button className={`settings-full-btn container ${user.message_display === "standard" ? "active" : ""}`} onClick={e => set_message_display(e.target, user, setUser, "standard", setFlash)}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.message_display === "standard" ? "active" : ""}`}></div></div>
                    Standard
                </button>
                <button className={`settings-full-btn container ${user.message_display === "compact" ? "active" : ""}`} onClick={e => set_message_display(e.target, user, setUser, "compact", setFlash)}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user.message_display === "compact" ? "active" : ""}`}></div></div>
                    Compact
                </button>
            </div>
        </>
    )
}