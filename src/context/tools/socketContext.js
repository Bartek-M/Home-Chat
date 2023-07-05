import React, { useContext, useMemo } from "react"
import { io } from "socket.io-client"

const SocketContext = React.createContext()
export function useSocket() { return useContext(SocketContext) }

export function SocketProvider({ children }) {
    const socket = useMemo(() => io({ auth: { token: localStorage.getItem("token") } }), [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}