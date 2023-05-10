export function Notifications() {
    return (
        <>
            <h2 className="settings-title">Notifications</h2>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">Enable Unread Message Badge</p>
                    <p>It's good to have a strong password everywhere</p>
                </div>
                <button className="edit-settings-btn" onClick={() => card("password")}>Change Password</button>
            </div>
            <div className="spaced-container">
            <div className="column-container">
                <p className="category-text">TWO-FACTOR AUTHENTICATION</p>
                <p>Two-Factor authentication is a good way to add an extra layer of security for your Home Chat account to make sure that only you have the ability to log in.</p>
                {user.mfa_enabled===0 && <button className="action-settings-btn " onClick={() => card("mfa")}>Setup 2FA</button>}
                {user.mfa_enabled===1 && <button className="warning-settings-btn" onClick={() => card("mfa")}>Remove 2FA</button>}
            </div>
            </div>
            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">ACCOUNT VISIBILITY</p>
                    <p>Change your account visibility</p>
                </div>
                <button className="settings-btn" id={user.visibility ? "visibility-public" : "visibility-private"} onClick={() => set_visibility(user, setUser)}>
                    {user.visibility ? "Public" : "Private"}
                </button>
            </div>
        </>
    )
}