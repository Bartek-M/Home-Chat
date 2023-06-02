import { useRef } from "react"

import { useUser } from "../../../context"
import { api_file, flash_message } from "../../../utils"

function change_avatar(file, setUser) {
    const user_file = file.files[0]
    if (!user_file) return

    const form_data = new FormData()
    form_data.append("image", user_file, "untitled.jpg")

    api_file("avatar", form_data)
        .then(res => {
            if (res.errors && res.errors.image) return flash_message(res.errors.image, "error")

            if (res.message === "200 OK" && res.image) {
                setUser((current_user) => { return { ...current_user, avatar: res.image } })
                return flash_message("Avatar updated!")
            }

            flash_message("Something went wrong!", "error")
        })
}

export function Account({ props }) {
    const { card } = props
    const [user, setUser] = useUser()

    const file_input = useRef()

    return (
        <>
            <h2 className="settings-title">Account</h2>
            <div className="settings-card column-container">
                <div className="user-info center-container">
                    <div className="avatar-wrapper center-container" onClick={() => file_input.current.click()}>
                        <img className="settings-avatar" src={`/api/images/${user.avatar}.webp`} />
                        <div className="change-icon center-container absolute-container">
                            CHANGE<br />AVATAR
                            <input ref={file_input} type="file" accept="image/*" onChange={() => change_avatar(file_input.current, setUser)} />
                        </div>
                        <div className="add-avatar-icon">
                            <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                            </svg>
                        </div>
                    </div>
                    <div className="column-container">
                        {user.display_name && <h2>{user.display_name}</h2>}
                        <h2 className={user.display_name ? "username" : ""}>{user.name}</h2>
                    </div>
                </div>
                <div className="account-settings column-container">
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">DISPLAY NAME</p>
                            <p>{user.display_name ? user.display_name : "You haven't added a display name yet."}</p>
                        </div>
                        <button className="edit-settings-btn" onClick={() => card("display_name")}>{user.display_name ? "Edit" : "Add"}</button>
                    </div>
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">USERNAME</p>
                            <p>{user.name}</p>
                        </div>
                        <button className="edit-settings-btn" onClick={() => card("username")}>Edit</button>
                    </div>
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">EMAIL</p>
                            <p>{user.email}</p>
                        </div>
                        <button className="edit-settings-btn" onClick={() => card("email")}>Edit</button>
                    </div>
                </div>
            </div>
            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">USER ID</p>
                    <p>{user.id}</p>
                </div>
                <button className="action-settings-btn " onClick={() => {
                    try { navigator.clipboard.writeText(user.id) } catch { return flash_message("Something went wrong!", "error") }
                    flash_message("ID Copied!")
                }}>Copy</button>
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">ACCOUNT REMOVAL</p>
                    <p>Delete your account (This action can not be reverted!)</p>
                </div>
                <button className="warning-settings-btn" onClick={() => card("delete_account")}>Delete Account</button>
            </div>
        </>
    )
}