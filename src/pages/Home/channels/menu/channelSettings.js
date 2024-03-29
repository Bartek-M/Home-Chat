import { useRef, useState, useEffect } from "react"
import { useActive, useFlash, useUser } from "../../../../context"

import { MFA } from "../../../../components"
import { apiSend, apiFile } from "../../../../utils"

// Functions
function setImage(file, icon) {
    const user_file = file.files[0]
    if (!user_file) return

    icon.src = URL.createObjectURL(user_file)
}

function submit_settings(button, channel, name, nick, notifications, icon, img_file, close, setFlash) {
    if ((name && name.value !== "" && name.value !== channel.name) || (nick && nick.value !== channel.nick) || (notifications && notifications.checked !== (channel.notifications >= 1 ? true : false))) {
        apiSend(button, "channelSettings", {
            name: (name && name.value !== channel.name) ? name.value : null,
            nick: nick.value,
            notifications: notifications.checked
        }, "PATCH", channel.id).then(res => {
            if (res.errors) {
                if (res.errors.channel) return setFlash(res.errors.channel, "error")
                document.getElementById("name-error").innerText = res.errors.name ? `- ${res.errors.name}` : "*"
                document.getElementById("nick-error").innerText = res.errors.nick ? `- ${res.errors.nick}` : "*"
                return
            }

            if (res.message === "200 OK") {
                if (!(img_file && img_file.files && img_file.files[0] && !icon.src.includes("/api/images/channels/generic.webp"))) close()
                return setFlash("Settings saved")
            }

            if (res.message) return setFlash(res.message, "error")
            setFlash("Something went wrong!", "error")
        })
    }

    if (img_file && img_file.files[0] && !icon.src.includes("/api/images/channels/generic.webp")) {
        const user_file = img_file.files[0]
        const form_data = new FormData()
        form_data.append("image", user_file, "untitled.jpg")

        apiFile(button, "icon", form_data, channel.id).then(res => {
            if (res.errors) {
                if (res.errors.image) setFlash(res.errors.image, "error")
                if (res.errors.channel) setFlash(res.errors.channel, "error")
                return
            }

            if (res.message === "200 OK" && res.image) {
                close()
                return setFlash("Icon saved")
            }

            if (res.message) return setFlash(res.message, "error")
            setFlash("Something went wrong!", "error")
        })
    }
}

function delete_channel({ button, active, password, code, close, setFlash }) {
    if ((password && !password.value) || (code && !code.value)) return
    if (!active.channel) return

    const channel_id = active.channel.id
    const channel_name = active.channel.name

    apiSend(button, "channelDelete", {
        password: password ? password.value : null,
        code: code ? code.value : null
    }, "DELETE", channel_id).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")

            if (document.getElementById("password-error")) return document.getElementById("password-error").innerText = res.errors.password ? `- ${res.errors.password}` : "*"
            if (document.getElementById("code-error")) return document.getElementById("code-error").innerText = `- ${res.errors.code}`
            return
        }

        if (res.message === "200 OK") {
            close()
            return setFlash(`Deleted '${channel_name}'`)
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}


export function ChannelSettings({ props }) {
    const { close } = props

    const [user,] = useUser()
    const setFlash = useFlash()

    const [active,] = useActive()
    const channel = active.channel

    const [checked, setChecked] = useState(false)
    useEffect(() => { setChecked(channel.notifications ? true : false) }, [channel.notifications])

    const channel_name = useRef()
    const nick = useRef()
    const notifications = useRef()
    const channel_icon = useRef()
    const file_input = useRef()
    const passw = useRef()


    // Delete channel password or MFA check
    const [page, setPage] = useState(null)

    if (page && user.mfa_enabled) return <MFA title={`Delete '${channel.name}'`} submit_text="Delete" warning={true} submit_function={delete_channel} close={close} />
    if (page) return (
        <form className="settings-edit-card center-column-container">
            <div className="column-container">
                <h3>Delete '{channel.name}'</h3>
            </div>
            <div className="column-container">
                <p className="category-text">PASSWORD <span className="error-category-text" id="password-error" key="password-error">*</span></p>
                <input className="input-field small-card-field" type="password" autoFocus ref={passw} key="password-inpt" maxLength={10} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" value="Delete" onClick={(e) => {
                    e.preventDefault()
                    delete_channel({ button: e.target, active: active, password: passw.current, close: close, setFlash: setFlash })
                }} />
            </div>
        </form>
    )

    // Channel settings
    return (
        <div className="settings-edit-card channel-stngs-card center-column-container">
            <div className="column-container">
                <h2>Channel Settings</h2>
                <button className="card-close center-container" onClick={() => close()}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            {!channel.direct && (channel.owner === user.id || channel.admin) &&
                <>
                    <div className="spaced-container">
                        <div className="avatar-wrapper center-container" onClick={() => file_input.current.click()}>
                            <img className="settings-avatar skeleton" ref={channel_icon} src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`} onError={(e) => { if (!e.target.src.includes("/api/images/channels/generic.webp")) e.target.src = "/api/images/channels/generic.webp" }} onLoad={(e) => e.target.classList.remove("skeleton")} />
                            <div className="change-icon center-container absolute-container">
                                CHANGE<br />ICON
                                <input ref={file_input} type="file" accept="image/*" onChange={() => setImage(file_input.current, channel_icon.current)} />
                            </div>
                            <div className="add-avatar-icon">
                                <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                </svg>
                            </div>
                        </div>
                        <div className="column-container">
                            <p className="category-text">GROUP NAME <span className="error-category-text" id="name-error">*</span></p>
                            <input className="input-field small-card-field" spellCheck={false} defaultValue={channel.name} ref={channel_name} maxLength={80} required />
                        </div>
                    </div>
                    <hr className="separator" />
                </>
            }
            <div className="column-container">
                <p className="category-text">NICKNAME <span className="error-category-text" id="nick-error">*</span></p>
                <input className="input-field small-card-field" spellCheck={false} ref={nick} defaultValue={channel.nick} maxLength={32} required />
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">NOTIFICATIONS</p>
                    <p>Enable notifications from this channel</p>
                </div>
                <input
                    className="slider"
                    type="checkbox"
                    ref={notifications}
                    checked={checked}
                    disabled={!user.notifications_message || !user.notifications}
                    onChange={() => setChecked(checked => !checked)}
                />
            </div>
            {!channel.direct && channel.owner === user.id &&
                <>
                    <hr className="separator" />
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">DELETE CHANNEL</p>
                            <p>This action cannot be undone and all messages will be lost.</p>
                        </div>
                        <button className="warning-settings-btn" onClick={() => setPage(true)}>Delete</button>
                    </div>
                </>
            }
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" value="Save" onClick={e => {
                    e.preventDefault()
                    submit_settings(e.target, channel, channel_name.current, nick.current, notifications.current, channel_icon.current, file_input.current, close, setFlash)
                }} />
            </div>
        </div>
    )
}