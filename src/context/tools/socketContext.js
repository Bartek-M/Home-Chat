import React, { useContext, useEffect, useMemo } from "react"
import { useUser } from "../data/userContext"

import { io } from "socket.io-client"

const SocketContext = React.createContext()
export function useSocket() { return useContext(SocketContext) }

export function SocketProvider({ children }) {
    const [, setUser] = useUser()
    const socket = useMemo(() => io({ auth: { token: localStorage.getItem("token") } }), [])

    // useEffect(() => {
    //     const onConnect = () => {}
    //     socket.on("connect", onConnect)

    //     return () => { socket.off("connect", onConnect) }
    // }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}