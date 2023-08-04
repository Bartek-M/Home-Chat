import { useEffect, useMemo, useRef } from "react"
import { useActive, useFlash } from "../../../../context"

import { apiSend } from "../../../../utils"

function sendMessage(button, message, channel_id, setFlash) {
    if (!message.innerText || !message.innerText.trim()) return
    if (button.disabled) return

    apiSend(button, "channelMessage", {
        content: message.innerText.trim()
    }, "POST", channel_id).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")
            if (res.errors.message) return setFlash(res.errors.message, "error")
        }

        if (res.message === "200 OK" && res.content) return message.innerText = ""

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

function editMessage(button, input_content, message, channel_id, setFlash, setActive) {
    const content = input_content.innerText

    if (!content || !content.trim()) return
    if (content.trim() === message.content.trim()) return
    if (button.disabled) return

    apiSend(button, "messageEdit", {
        content: content.trim()
    }, "PATCH", [channel_id, message.id]).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")
            if (res.errors.message) return setFlash(res.errors.message, "error")
        }

        if (res.message === "200 OK") {
            setActive({ message: null })
            return input_content.innerText = ""
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function ChatInput({ channel }) {
    const [active, setActive] = useActive()
    const setFlash = useFlash()

    const messageContent = useRef()
    const sendBtn = useRef()

    const isEditing = useMemo(() => { return (active.message && active.message.channel_id === active.channel.id && active.message.editing) }, [active.message, channel.id])
    useEffect(() => { return () => setActive({ message: null }) }, [])

    return (
        <div className="chat-inpt-wrapper container">
            {isEditing &&
                <div className="message-editing-wrapper container">
                    <button className="cancel-edit-btn center-container" onClick={() => setActive({ message: null })}>
                        <svg width="8" height="8" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                            <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                        </svg>
                    </button>
                    <p>Editing Message</p>
                </div>
            }
            <div className="chat-inpt-scroller scroller-container">
                <div className="chat-inpt" ref={messageContent} autoFocus contentEditable suppressContentEditableWarning
                    onKeyDown={e => {
                        if (window.matchMedia("(pointer: coarse)").matches) return
                        if (!e.shiftKey && e.code === "Enter") e.preventDefault()
                    }}
                    onKeyUp={e => {
                        if (e.shiftKey || e.code !== "Enter") return
                        if (window.matchMedia("(pointer: coarse)").matches) return

                        if (isEditing) return editMessage(sendBtn.current, messageContent.current, active.message, channel.id, setFlash, setActive)
                        sendMessage(sendBtn.current, messageContent.current, channel.id, setFlash)
                    }}
                >{isEditing ? active.message.content : null}</div>
            </div>
            <div className="chat-send-wrapper center-container">
                <hr className="chat-separator" />
                <button className="chat-send-btn center-container" ref={sendBtn} onClick={() => {
                    if (isEditing) return editMessage(sendBtn.current, messageContent.current, active.message, channel.id, setFlash, setActive)
                    sendMessage(sendBtn.current, messageContent.current, channel.id, setFlash)
                }}>
                    <svg width="20" height="20" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                        <path d="M8.2738 8.49222L1.99997 9.09877L0.349029 14.3788C0.250591 14.691 0.347154 15.0322 0.595581 15.246C0.843069 15.4597 1.19464 15.5047 1.48903 15.3613L15.2384 8.7032C15.5075 8.57195 15.6781 8.29914 15.6781 8.00007C15.6781 7.70101 15.5074 7.4282 15.2384 7.29694L1.49839 0.634063C1.20401 0.490625 0.852453 0.535625 0.604941 0.749376C0.356493 0.963128 0.259941 1.30344 0.358389 1.61563L2.00932 6.89563L8.27093 7.50312C8.52405 7.52843 8.71718 7.74125 8.71718 7.99531C8.71718 8.24938 8.52406 8.46218 8.27093 8.4875L8.2738 8.49222Z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}