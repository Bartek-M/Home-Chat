import { useUser } from "../../../context"

export function Notifications() {
    const [user, setUser] = useUser()

    return (
        <>
            <h2 className="settings-title">Notifications</h2>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">ENABLE NOTIFICATIONS</p>
                    <p>Stay up to date every time you open Home Chat</p>
                </div>
                <input className="slider" type="checkbox" defaultChecked={user.notifications ? true : false} onChange={e => setUser(current_user => { return { ...current_user, notifications: e.target.checked ? 1 : 0 } })} />
            </div>

            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">CHANNEL MESSAGES</p>
                    <p>Show unread channel messages</p>
                </div>
                <input className="slider" type="checkbox" defaultChecked={user.notifications_message ? true : false} disabled={!user.notifications ? true : false} />
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">FRIEND REQUESTS</p>
                    <p>Show unread friend requests</p>
                </div>
                <input className="slider" type="checkbox" defaultChecked={user.notifications_friend ? true : false} disabled={!user.notifications ? true : false} />
            </div>

            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">CHANGE LOG</p>
                    <p>See new features with change log</p>
                </div>
                <input className="slider" type="checkbox" defaultChecked={user.notifications_changelog ? true : false} disabled={!user.notifications ? true : false} />
            </div>
        </>
    )
}