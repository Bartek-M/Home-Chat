import { useFlash, useUser } from "../../../context"
import { apiSend, } from "../../../utils"

// Functions
function set_visibility(button, user, setUser, setFlash) {
    apiSend(button, "userSettings", {
        category: "visibility",
        data: user.visibility ? 0 : 1
    }, "PATCH", "@me").then(res => {        
        if (res.message === "200 OK") {
            setUser((current_user) => { return { ...current_user, visibility: user.visibility ? 0 : 1 } })
            return setFlash("Visibility saved!")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

// Render
export function Security({ props }) {
    const { card } = props

    const [user, setUser] = useUser()
    const setFlash = useFlash()

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
                    {user.mfa_enabled === 0 && <button className="action-settings-btn " onClick={() => card("mfa")}>Setup 2FA</button>}
                    {user.mfa_enabled === 1 && <button className="warning-settings-btn" onClick={() => card("mfa")}>Remove 2FA</button>}
                </div>
            </div>
            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">ACCOUNT VISIBILITY</p>
                    <p>Change your account visibility</p>
                </div>
                <button className="settings-btn" id={user.visibility ? "visibility-public" : "visibility-private"} onClick={(e) => set_visibility(e.target, user, setUser, setFlash)}>
                    {user.visibility ? "Public" : "Private"}
                </button>
            </div>
        </>
    )
}