import { useFlash, useUser } from "../../../context"
import { apiSend } from "../../../utils"

function set_notifications(button, option, position, setUser, setFlash) {
    if (!option) return
    if (position !== 1 && position !== 0) return

    apiSend(button, "notifications", {
        option: option,
        position: position
    }, "PATCH", "@me").then(res => {        
        if (res.errors) {
            if (res.errors.option) return setFlash(res.errors.option, "error")
            if (res.errors.position) return setFlash(res.errors.position, "error")

            return setFlash("Something went wrong", "error")
        }

        if (res.message === "200 OK" && res.position !== undefined) {
            if (option === "notifications") return setFlash(`${res.position ? "Enabled" : "Disabled"} notifications`)
            return setFlash(`${res.position ? "Enabled" : "Disabled"} ${option.replace("_", " ")}`)
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function Notifications() {
    const [user, setUser] = useUser()
    const setFlash = useFlash()

    return (
        <>
            <h2 className="settings-title">Notifications</h2>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">ENABLE NOTIFICATIONS</p>
                    <p>Stay up to date every time you open Home Chat</p>
                </div>
                <input
                    className="slider"
                    type="checkbox"
                    checked={user.notifications ? true : false}
                    onChange={e => set_notifications(e.target, "notifications", e.target.checked ? 1 : 0, setUser, setFlash)}
                />
            </div>

            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">CHANNEL MESSAGES</p>
                    <p>Show unread channel messages</p>
                </div>
                <input
                    className="slider"
                    type="checkbox"
                    checked={user.notifications_message ? true : false}
                    disabled={!user.notifications ? true : false}
                    onChange={e => set_notifications(e.target, "notifications_message", e.target.checked ? 1 : 0, setUser, setFlash)}
                />
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">FRIEND REQUESTS</p>
                    <p>Show unread friend requests</p>
                </div>
                <input
                    className="slider"
                    type="checkbox"
                    checked={user.notifications_friend ? true : false}
                    disabled={!user.notifications ? true : false}
                    onChange={e => set_notifications(e.target, "notifications_friend", e.target.checked ? 1 : 0, setUser, setFlash)}
                />
            </div>

            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">CHANGE LOG</p>
                    <p>See new features with change log</p>
                </div>
                <input
                    className="slider"
                    type="checkbox"
                    checked={user.notifications_changelog ? true : false}
                    disabled={!user.notifications ? true : false}
                    onChange={e => set_notifications(e.target, "notifications_changelog", e.target.checked ? 1 : 0, setUser, setFlash)}
                />
            </div>
        </>
    )
}