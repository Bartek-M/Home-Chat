export function Notifications() {
    return (
        <>
            <h2 className="settings-title">Notifications</h2>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">ENABLE NOTIFICATIONS</p>
                    <p>Stay up to date every time you open Home Chat</p>
                </div>
                <input className="slider" type="checkbox" />
            </div>

            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">CHANNEL MESSAGES</p>
                    <p>Show unread channel messages</p>
                </div>
                <input className="slider" type="checkbox" />
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">FRIEND REQUESTS</p>
                    <p>Show unread friend requests</p>
                </div>
                <input className="slider" type="checkbox" />
            </div>

            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">CHANGE LOG</p>
                    <p>See new features with change log</p>
                </div>
                <input className="slider" type="checkbox" />
            </div>
        </>
    )
}