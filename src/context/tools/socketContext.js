import React, { useContext, useEffect } from "react"

import { io } from "socket.io-client"
const socket = io()

const SocketContext = React.createContext()
export function useSocket() { return useContext(SocketContext) }

export function SocketProvider({ children }) {
    useEffect(() => {
        const onConnect = () => { console.log("CONNECTED") }
        const onDisconnect = () => console.log("DISCONNECTED")

        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)

        return () => {
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
        }
    }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}