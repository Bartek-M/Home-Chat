export function ResetMFA() {
    return (
        <div className="login-page center-container">
            <div className="settings-edit-card column-container">
                <h3>Two-Factor authentication</h3>
                <div className="justified-wrapper">Removed 2FA from your account. Using 2FA secures your account and is recommended for all users, so you might think about bringing it back.</div>
                <a className="link" href="/login">Login</a>
            </div>
        </div>
    )
}