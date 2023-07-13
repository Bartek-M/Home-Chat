import React, { useState, useContext, useRef, useEffect } from "react"

const FlashContext = React.createContext()
export function useFlash() { return useContext(FlashContext) }

export function FlashProvider({ children }) {
    const [flashMessage, setFlashMessage] = useState(null)
    const message = useRef()

    const setFlash = (text, type = "info") => setFlashMessage({ text: text, type: type })

    useEffect(() => {
        if (!flashMessage) return
        let text = flashMessage.text

        setTimeout(() => {
            if (!message.current || message.current.offsetTop !== -100) return
            if (text !== flashMessage.text) return

            setFlashMessage(null)
        }, 3000)
    }, [flashMessage])


    return (
        <FlashContext.Provider value={setFlash}>
            {children}
            <div className="layer">
                {flashMessage && flashMessage.text
                    ? <div className="flash-message center-container" ref={message} key={Math.random()}>
                        {flashMessage.type === "error" &&
                            <svg width="14" height="14" fill="#c24246" viewBox="0 0 16 16">
                                <path stroke="#c24246" strokeWidth="2" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                            </svg>
                        }
                        {flashMessage.type === "info" &&
                            <svg width="20" height="20" fill="#3ba55c" viewBox="0 0 16 16">
                                <path stroke="#3ba55c" strokeWidth="2" d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                            </svg>
                        }
                        {flashMessage.type === "connect" &&
                            <svg width="20" height="20" fill="var(--BLUE)" viewBox="0 0 16 16">
                                <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 4.854-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z" />
                            </svg>
                        }
                        {flashMessage.text}
                    </div>
                    : null
                }
            </div>
        </FlashContext.Provider>
    )
}