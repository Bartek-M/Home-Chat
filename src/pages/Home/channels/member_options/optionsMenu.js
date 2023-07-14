import { useRef, useEffect } from "react"
import { useActive, useChannels, useFlash, useUser } from "../../../../context"

import { apiSend } from "../../../../utils"

function setAdmin(button, member, channel_id, setChannels, setFlash) {
    apiSend(button, "memberAdmin", {}, "PATCH", [channel_id, member.id]).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")
            if (res.errors.user) return setFlash(res.errors.user, "error")
        }

        if (res.message === "200 OK") return setFlash(res.admin_status ? `Set ${member.name} as admin` : `Removed ${member.name} as admin`)

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function OptionsMenu({ element, member, channel, x, y, close, setCard }) {
    const [user,] = useUser()
    const [, setChannels] = useChannels()
    const [, setActive] = useActive()
    const setFlash = useFlash()

    const menu = useRef()

    useEffect(() => {
        setActive({ user: member })

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
            <button className="channel-menu-btn spaced-container" onClick={() => { setCard("memberNick"); close() }}>Change Nickname</button>
            {!channel.direct &&
                <button className="channel-menu-btn spaced-container" onClick={e => { setAdmin(e.target, member, channel.id, setChannels, setFlash); close() }}>{member.admin ? "Remove as Admin" : "Set as Admin"}</button>
            }
            {(!channel.direct && channel.owner === user.id) &&
                <button className="channel-menu-btn spaced-container" onClick={() => { setCard("transferOwner"); close() }}>Transfer Ownership</button>
            }
            {!channel.direct &&
                <>
                    <hr className="separator" />
                    <button className="channel-menu-btn leave-btn spaced-container" onClick={() => { setCard("memberKick"); close() }}>Kick '{member.name}'</button>
                </>
            }
        </div>
    )
}