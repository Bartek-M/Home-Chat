import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export function Tooltip({ text, note, type, children }) {
    const [showTooltip, setShowTooltip] = useState(false)
    const ref = useRef()

    useEffect(() => {
        const onMouseEnter = () => setShowTooltip(true)
        const onMouseLeave = () => setShowTooltip(false)

        ref.current.addEventListener("mouseenter", onMouseEnter)
        ref.current.addEventListener("click", onMouseLeave)
        ref.current.addEventListener("mouseleave", onMouseLeave)

        return () => {
            if (!ref.current) return
            
            ref.current.removeEventListener("mouseenter", onMouseEnter)
            ref.current.removeEventListener("click", onMouseLeave)
            ref.current.removeEventListener("mouseleave", onMouseLeave)
        }
    }, [])

    const tooltip = showTooltip ? (<div className={`tooltip-${type}`} style={
        type === "right" 
        ? {
            top: ref.current.getBoundingClientRect().bottom,
            left: ref.current.getBoundingClientRect().right + 20,
            transform: `translateY(calc(-50% - ${ref.current.offsetHeight / 2}px))`
        } 
        : {
            top: ref.current.getBoundingClientRect().top,
            left: ref.current.getBoundingClientRect().right,
            transform: `translate(calc(-50% - ${ref.current.offsetWidth / 2}px), -125%)`
        }
    }>
        {note && <p>{note}</p>}
        <p className={note ? "text-note" : ""}>{text}</p>
    </div>) : null

    return (
        <div ref={ref}>
            {children}
            {document.getElementsByClassName("layer")[0] ? createPortal(tooltip, document.getElementsByClassName("layer")[0]) : null}
        </div>
    )
}