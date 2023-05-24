import { useRef, useEffect } from "react"

export function ChannelMenu({ element, x, y, close }) {
    const menu = useRef()

    useEffect(() => {
        const listener = (e) => {
            if (!element.current || element.current.contains(e.target) || menu.current.contains(e.target)) return
            close()
        }

        document.addEventListener("click", listener)
        return () => { document.removeEventListener("click", listener) }
    }, [])

    return (
        <div className="channel-menu center-column-container" ref={menu} style={{ top: y + 40, left: x, transform: "translateX(-100%)" }}>
            <button>Channel Settings</button>
            <button>Channel Members</button>
            <button>Invite People</button>
            <button>Leave Channel</button>
        </div>
    )
}