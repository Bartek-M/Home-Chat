import React, { useContext, useMemo, useEffect, useState } from "react"
import { useFlash, useUser } from ".."

import { io } from "socket.io-client"
import { Loading } from "../../components"

const SocketContext = React.createContext()
export function useSocket() { return useContext(SocketContext) }

export function SocketProvider({ children }) {
    const [user, setUser] = useUser()
    const setFlash = useFlash()

    const socket = useMemo(() => io({ auth: { token: localStorage.getItem("token") } }), [])
    const [isConnected, setIsConnected] = useState(null)

    useEffect(() => {
        const onConnect = () => { setIsConnected(true); setFlash(`Connected as ${user.name}`, "connect") }
        const onDisconnect = () => { setIsConnected(false); setFlash("Disconnected from WebSocket", "error") }
        const onConnectError = () => { if (isConnected) setIsConnected(false) }

        const onChange = (data) => {
            if (!data.setting || data.content === undefined) return
            setUser(current_user => {
                if (current_user[data.settings] === data.content) return current_user
                current_user[data.setting] = data.content

                return { ...current_user }
            })
        }

        const onLogout = (data) => {
            setFlash(`Logout - ${data.reason}`)
            setTimeout(() => window.location.reload(), 2000)
        }

        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)
        socket.on("connect_error", onConnectError)

        socket.on("user_change", onChange)
        socket.on("logout", onLogout)

        return () => {
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
            socket.off("connect_error", onConnectError)

            socket.off("user_change", onChange)
            socket.on("logout", onLogout)
        }
    }, [])

    if (isConnected === false) return (<Loading message="No connection with WebSocket" />)

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}