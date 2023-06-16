import { useRef, useEffect } from "react"
import { useChannels, useFlash, useUser } from "../../../../context"

import { apiSend } from "../../../../utils"

function setAdmin(button, member, channel_id, setChannels, close, setCard, setFlash) {
    apiSend(button, "memberAdmin", {}, "PATCH", [channel_id, member.id]).then(res => {
        console.log(res)
    })
}

export function OptionsMenu({ element, member, channel, x, y, close, setCard }) {
    const [user,] = useUser()
    const [,setChannels] = useChannels()
    const setFlash = useFlash()

    const menu = useRef()

    useEffect(() => {
        const listener = (e) => {
            if (!element || element.contains(e.target) || menu.current.contains(e.target)) return
            close()
        }

        document.addEventListener("click", listener)
        window.addEventListener("resize", close)

        return () => {
            document.removeEventListener("click", listener)
            window.removeEventListener("resize", close)
        }
    }, [])

    return (
        <div className="channel-menu center-column-container" ref={menu} style={{ top: y + 20, left: x, transform: "translateX(-95%)" }}>
            <button className="channel-menu-btn spaced-container" onClick={() => { setCard("member_nick"); close() }}>Change Nickname</button>
            {!channel.direct &&
                <button className="channel-menu-btn spaced-container" onClick={e => setAdmin(e.target, member, channel.id, setChannels, close, setCard, setFlash)}>{member.admin ? "Remove as Admin" : "Make Admin"}</button>
            }
            {(!channel.direct && channel.owner === user.id) &&
                <button className="channel-menu-btn spaced-container" onClick={() => { setCard("transfer_owner"); close() }}>Transfer Ownership</button>
            }
            {!channel.direct &&
                <>
                    <hr className="separator" />
                    <button className="channel-menu-btn leave-btn spaced-container" onClick={() => { setCard("member_kick"); close() }}>Kick '{member.name}'</button>
                </>
            }
        </div>
    )
}