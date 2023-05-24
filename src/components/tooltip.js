import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export function Tooltip({ text, type, children }) {
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
            top: ref.current.getBoundingClientRect().top,
            left: ref.current.getBoundingClientRect().right + 20,
            transform: "translateY(25%)"
        } 
        : {
            top: ref.current.getBoundingClientRect().top,
            left: ref.current.getBoundingClientRect().right,
            transform: `translate(calc(-50% - ${ref.current.offsetWidth / 2}px), -125%)`
        }
    }>{text}</div>) : null

    return (
        <div ref={ref}>
            {children}
            {document.getElementsByClassName("layer")[0] ? createPortal(tooltip, document.getElementsByClassName("layer")[0]) : null}
        </div>
    )
}