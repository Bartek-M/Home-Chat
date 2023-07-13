import React, { useContext, useMemo, useEffect } from "react"
import { useUser } from ".."

import { io } from "socket.io-client"

const SocketContext = React.createContext()
export function useSocket() { return useContext(SocketContext) }

export function SocketProvider({ children }) {
    const [, setUser] = useUser()
    const socket = useMemo(() => io({ auth: { token: localStorage.getItem("token") } }), [])

    useEffect(() => {
        const onChange = (data) => {
            if (!data.setting || data.content === undefined) return
            setUser(current_user => {
                if (current_user[data.settings] === data.content) return current_user
                current_user[data.setting] = data.content

                return { ...current_user }
            })
        }

        socket.on("user_change", onChange)
        return () => socket.off("user_change", onChange)
    }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}