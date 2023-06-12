import { useFlash, useUser } from "../../../context"
import { apiSend } from "../../../utils"

function set_notifications(button, option, position, setUser, setFlash) {
    if (!option) return
    if (position !== 1 && position !== 0) return

    apiSend(button, "notifications", {
        option: option,
        position: position
    }, "PATCH", "@me").then(res => {
        if (res.message === "429 Too Many Requests") return setFlash("Too many requests", "error")
        
        if (res.errors) {
            if (res.errors.option) return setFlash(res.errors.option, "error")
            if (res.errors.position) return setFlash(res.errors.position, "error")

            return setFlash("Something went wrong", "error")
        }

        if (res.message === "200 OK" && res.position !== undefined) {
            if (option === "notifications") {
                setUser(current_user => { return { ...current_user, notifications: res.position } })
                return setFlash(`${res.position ? "Enabled" : "Disabled"} notifications`)
            }

            setUser(current_user => {
                current_user[`notifications_${option}`] = res.position
                return current_user
            })
            return setFlash(`${res.position ? "Enabled" : "Disabled"} ${option} notifications`)
        }

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
                    defaultChecked={user.notifications ? true : false}
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
                    defaultChecked={user.notifications_message ? true : false}
                    disabled={!user.notifications ? true : false}
                    onChange={e => set_notifications(e.target, "message", e.target.checked ? 1 : 0, setUser, setFlash)}
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
                    defaultChecked={user.notifications_friend ? true : false}
                    disabled={!user.notifications ? true : false}
                    onChange={e => set_notifications(e.target, "friend", e.target.checked ? 1 : 0, setUser, setFlash)}
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
                    defaultChecked={user.notifications_changelog ? true : false}
                    disabled={!user.notifications ? true : false}
                    onChange={e => set_notifications(e.target, "changelog", e.target.checked ? 1 : 0, setUser, setFlash)}
                />
            </div>
        </>
    )
}