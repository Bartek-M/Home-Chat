import { api_send, flash_message } from "../../../utils"

export { MFA } from "./cards/mfa"
export { Password } from "./cards/password"

// Functions
function set_visibility(user, setUser) {
    setUser({ ...user, visibility: user.visibility ? 0 : 1 })
    api_send("user_settings", { category: "visibility", data: user.visibility ? 0 : 1 }, "@me").then(() => flash_message("Visibility saved!")) // Send to api
}

// Render
export default function Security({ props }) {
    const { user, setUser, card } = props

    return (
        <>
            <h2 className="settings-title">Security</h2>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">PASSWORD</p>
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