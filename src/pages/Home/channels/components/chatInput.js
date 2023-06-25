import { useRef } from "react"
import { useSocket, useUser } from "../../../../context"

export function ChatInput({ channel }) {
    const socket = useSocket()
    const [user,] = useUser()

    const message_content = useRef()

    return (
        <div className="chat-inpt-wrapper container">
            <div className="chat-inpt-scroller scroller-container">
                <div className="chat-inpt" ref={message_content} autoFocus contentEditable onKeyDown={e => { if (!e.shiftKey && e.code === "Enter") e.preventDefault() }} onKeyUp={e => {
                    if (e.shiftKey || e.code !== "Enter" || !message_content.current.innerText || !message_content.current.innerText.trim()) return

                    socket.send({ channel_id: channel.id, author: user, content: message_content.current.innerText.trim() })
                    message_content.current.innerText = ""
                }}></div>
            </div>
            <div className="chat-send-wrapper center-container">
                <hr className="chat-separator" />
                <button className="chat-send-btn center-container" onClick={e => {
                    if (!message_content.current.innerText || !message_content.current.innerText.trim()) return
                    socket.send({ channel_id: channel.id, author: user, content: message_content.current.innerText.trim() })
                    message_content.current.innerText = ""
                }}>
                    <svg width="20" height="20" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                        <path d="M8.2738 8.49222L1.99997 9.09877L0.349029 14.3788C0.250591 14.691 0.347154 15.0322 0.595581 15.246C0.843069 15.4597 1.19464 15.5047 1.48903 15.3613L15.2384 8.7032C15.5075 8.57195 15.6781 8.29914 15.6781 8.00007C15.6781 7.70101 15.5074 7.4282 15.2384 7.29694L1.49839 0.634063C1.20401 0.490625 0.852453 0.535625 0.604941 0.749376C0.356493 0.963128 0.259941 1.30344 0.358389 1.61563L2.00932 6.89563L8.27093 7.50312C8.52405 7.52843 8.71718 7.74125 8.71718 7.99531C8.71718 8.24938 8.52406 8.46218 8.27093 8.4875L8.2738 8.49222Z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}