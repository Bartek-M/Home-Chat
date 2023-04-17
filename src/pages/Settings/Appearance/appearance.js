import { useUser } from "../../../context"
import { api_send, flash_message } from "../../../utils"

// Functions
function set_theme(user, setUser, theme) {
    if (theme === user.theme) return
    
    api_send("user_settings", { 
        category: "theme", 
        data: theme 
    }, "PATCH", "@me").then(res => { 
        if (res.message === "200 OK") {
            setUser((current_user) => { return { ...current_user, theme: theme } })
            return flash_message("Theme saved!")
        }

        flash_message("Something went wrong!", "error")
    }) 
}

function set_message_display(user, setUser, msg_display) {
    if (msg_display === user.message_display) return

    api_send("user_settings", { 
        category: "message_display", 
        data: msg_display 
    }, "PATCH", "@me").then(res => { 
        if (res.message === "200 OK") {
            setUser((current_user) => { return { ...current_user, message_display: msg_display } })
            return flash_message("Message display saved!")
        }

        flash_message("Something went wrong!", "error")
    })
}

// Render
export function Appearance() {
    const [user, setUser] = useUser()

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