import React, { useContext, useEffect } from "react"
import { useUser } from "../data/userContext"

import { io } from "socket.io-client"
const socket = io({ auth: { token: localStorage.getItem("token") } })

const SocketContext = React.createContext()
export function useSocket() { return useContext(SocketContext) }

export function SocketProvider({ children }) {
    const [, setUser] = useUser()
    
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