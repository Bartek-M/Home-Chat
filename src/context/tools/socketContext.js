import React, { useContext, useMemo, useEffect } from "react"
import { useFlash, useUser } from ".."

import { io } from "socket.io-client"

const SocketContext = React.createContext()
export function useSocket() { return useContext(SocketContext) }

export function SocketProvider({ children }) {
    const [user, setUser] = useUser()
    const setFlash = useFlash()

    const socket = useMemo(() => io({ auth: { token: localStorage.getItem("token") } }), [])

    useEffect(() => {
        const onConnect = () => setFlash(`Connected as ${user.name}`, "connect")

        const onChange = (data) => {
            if (!data.setting || data.content === undefined) return
            setUser(current_user => {
                if (current_user[data.settings] === data.content) return current_user
                current_user[data.setting] = data.content

                return { ...current_user }
            })
        }

        socket.on("connect", onConnect)
        socket.on("user_change", onChange)
        
        return () => { 
            socket.off("connect", onConnect)
            socket.off("user_change", onChange)
        }
    }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}