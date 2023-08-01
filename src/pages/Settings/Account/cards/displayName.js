import { useRef } from "react"

import { useFlash, useUser } from "../../../../context"
import { apiSend } from "../../../../utils"

function update_displayname(button, user, display_name, close, setFlash) {
    if (user.display_name === display_name.value) return
    document.getElementById("display-name-error").innerText = display_name.value.length > 32 ? `- Must be between 1 and 32 characters long` : "*"

    apiSend(button, "userSettings", {
        category: "display_name",
        data: display_name.value,
    }, "PATCH", "@me").then(res => {
        if (res.errors) return document.getElementById("display-name-error").innerText = res.errors.display_name ? `- ${res.errors.display_name}` : "*"

        if (res.message === "200 OK") {
            close()
            return setFlash("Display name updated")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function DisplayName({ props }) {
    const { close } = props

    const [user,] = useUser()
    const setFlash = useFlash()

    const display_name = useRef()

    return (
        <form className="settings-edit-card center-column-container">
            <div className="column-container">
                <h3>Change your display name</h3>
            </div>
            <div className="column-container">
                <p className="category-text">DISPLAY NAME <span className="error-category-text" id="display-name-error" key="display-name-error">*</span></p>
                <input className="input-field small-card-field" type="text" autoFocus defaultValue={user.display_name ? user.display_name : ""} ref={display_name} key="name-inpt" maxLength={50} />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" value="Update" onClick={(e) => {
                    e.preventDefault()
                    update_displayname(e.target, user, display_name.current, close, setFlash)
                }} />
            </div>
        </form>
    )
}