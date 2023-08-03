import { useActive, useFlash } from "../../../../../context"
import { apiDelete } from "../../../../../utils"

function deleteMessage(button, channel_id, message_id, setFlash, close) {
    apiDelete(button, "messageDelete", [channel_id, message_id]).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")
            if (res.errors.message) return setFlash(res.errors.message, "error")
        }
        
        if (res.message === "200 OK") {
            close()
            return setFlash("Message Deleted")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function DeleteMessage({ props }) {
    const { close } = props
    
    const [active,] = useActive()
    const setFlash = useFlash()

    const channel = active.channel
    const message = active.message

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