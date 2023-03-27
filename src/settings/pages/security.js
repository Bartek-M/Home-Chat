import { api_send } from "../../api"
import { flash_message } from "../../functions"

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
                <button className="settings-btn stng-edit-btn" onClick={() => card("password")}>Edit</button>
            </div>
            <div className="column-container">
                <p className="category-text">TWO FACTOR AUTHENTICATION</p>
                <p>Good way to add an extra layer of security for your account</p>
                <button className="settings-btn stng-edit-btn" onClick={() => card("mfa")}>Setup</button>
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
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">TOKEN REGENRATE</p>
                    <p>Token is the most secret thing<br />For safety reasons, you can regenerate it</p>
                </div>
                <button className="settings-btn stng-warning-btn">Regenerate</button>
            </div>
        </>
    )
}