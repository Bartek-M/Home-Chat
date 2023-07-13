import React, { useContext, useMemo, useEffect } from "react"
import { useUser } from ".."

import { io } from "socket.io-client"

const SocketContext = React.createContext()
export function useSocket() { return useContext(SocketContext) }

export function SocketProvider({ children }) {
    const [user, setUser] = useUser()
    const socket = useMemo(() => io({ auth: { token: localStorage.getItem("token") } }), [])

    useEffect(() => {

    }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}