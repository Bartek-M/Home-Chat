export default function Appearance(props) {
    const { user, setUser } = props

    function set_theme(theme) {
        if (theme === user.theme) return

        document.documentElement.setAttribute("data-theme", theme)
        setUser({ ...user, theme: theme })
    }

    function set_message_display(msg_display) {
        if (msg_display === user.message_display) return
        setUser({ ...user, message_display: msg_display })
    }

    return (
        <>
            <h2 className="settings-title">Appearance</h2>
            <div className="column-container">
                <p className="category-text">THEME</p>
                <button className={`settings-full-btn container ${user ? (user.theme === "dark" ? "active" : "") : ""}`} onClick={() => set_theme("dark")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user ? (user.theme === "dark" ? "active" : "") : ""}`}></div></div>
                    Dark
                </button>
                <button className={`settings-full-btn container ${user ? (user.theme === "light" ? "active" : "") : ""}`} onClick={() => set_theme("light")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user ? (user.theme === "light" ? "active" : "") : ""}`}></div></div>
                    Light
                </button>
                <button className={`settings-full-btn container ${user ? (user.theme === "auto" ? "active" : "") : "active"}`} onClick={() => set_theme("auto")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user ? (user.theme === "auto" ? "active" : "") : "active"}`}></div></div>
                    Auto
                </button>
            </div>
            <hr className="separator" />
            <div className="column-container">
                <p className="category-text">MESSAGE DISPLAY</p>
                <button className={`settings-full-btn container ${user ? (user.message_display === "standard" ? "active" : "") : "active"}`} onClick={() => set_message_display("standard")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user ? (user.message_display === "standard" ? "active" : "") : "active"}`}></div></div>
                    Standard
                </button>
                <button className={`settings-full-btn container ${user ? (user.message_display === "compact" ? "active" : "") : ""}`} onClick={() => set_message_display("compact")}>
                    <div className="select-indicator-wrapper center-container"><div className={`select-indicator ${user ? (user.message_display === "compact" ? "active" : "") : ""}`}></div></div>
                    Compact
                </button>
            </div>
        </>
    )
}