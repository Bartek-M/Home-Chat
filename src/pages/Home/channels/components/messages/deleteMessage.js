import { useEffect } from "react"
import { useActive, useFlash } from "../../../../../context"

import { deleteMessage } from "../../../../../utils"

export function DeleteMessage({ props }) {
    const { close } = props

    const [active, setActive] = useActive()
    const setFlash = useFlash()

    const channel = active.channel
    const message = active.message

    useEffect(() => { return () => setActive({ message: null }) }, [])

    return (
        <div className="settings-edit-card column-container">
            <h3>Delete Message</h3>
            <p className="edit-card-info">Are you sure you want to delete this message?</p>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" type="button" onClick={() => close()}>Cancel</button>
                <input className="card-submit-btn warning-btn" type="submit" value="Delete" onClick={(e) => {
                    e.preventDefault()
                    deleteMessage(e.target, channel.id, message.id, setFlash, close)
                }} />
            </div>
        </div>
    )
}