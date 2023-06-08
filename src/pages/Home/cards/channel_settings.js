import { useMemo, useRef } from "react"
import { useChannels, useUser } from "../../../context"

// Functions
function set_image(file, icon) {
    const user_file = file.files[0]
    if (!user_file) return

    icon.src = URL.createObjectURL(user_file)
}

export function ChannelSettings({ props }) {
    const { close } = props

    const [user,] = useUser()
    const [channels, setChannels] = useChannels()

    const channel_name = useRef()
    const channel_icon = useRef()
    const file_input = useRef()

    const channel = useMemo(() => {
        if (!channels) return null
        return channels.find(channel => channel.active)
    }, [channels])

    console.log(channel)
    console.log(user)

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
                            <img className="settings-avatar" ref={channel_icon} src={channel.direct ? `/api/images/${channel.icon}.webp` : `/api/images/channels/${channel.icon}.webp`} onError={(e) => e.target.src = "/api/images/channels/generic.webp"} />
                            <div className="change-icon center-container absolute-container">
                                CHANGE<br />ICON
                                <input ref={file_input} type="file" accept="image/*" onChange={() => set_image(file_input.current, channel_icon.current)} />
                            </div>
                            <div className="add-avatar-icon">
                                <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                </svg>
                            </div>
                        </div>
                        <div className="column-container">
                            <p className="category-text">GROUP NAME <span className="error-category-name" id="name-error">*</span></p>
                            <input className="input-field small-card-field" spellCheck={false} defaultValue={channel.name} ref={channel_name} maxLength={50} required />
                        </div>
                    </div>
                    <hr className="separator" />
                </>
            }
            <div className="column-container">
                <p className="category-text">NICKNAME <span className="error-category-name" id="name-error">*</span></p>
                <input className="input-field small-card-field" spellCheck={false} maxLength={50} required />
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">NOTIFICATIONS</p>
                    <p>Enable notifications from this channel</p>
                </div>
                <input
                    className="slider"
                    type="checkbox"
                    defaultChecked={channel.notifications ? true : false}
                    disabled={!user.notifications_message || !user.notifications ? true : false}
                    onChange={e => console.log(e.target.checked)}
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
                        <button className="warning-settings-btn">Delete</button>
                    </div>
                </>
            }
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn submit-btn" type="submit" onClick={(e) => { e.preventDefault() }} value="Save" />
            </div>
        </div>
    )
}