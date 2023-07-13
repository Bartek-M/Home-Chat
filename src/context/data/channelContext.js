import React, { useState, useContext, useEffect } from "react"

import { apiGet } from "../../utils";
import { useFlash, useSocket } from "..";

const ChannelContext = React.createContext()
export function useChannels() { return useContext(ChannelContext) }

export function ChannelsProvider({ children }) {
    const [channels, setChannels] = useState({})
    const setFlash = useFlash()

    const socket = useSocket()

    useEffect(() => {
        const onMessage = (data) => {
            setChannels(current_channels => {
                if (!current_channels[data.channel_id]) return current_channels

                if (current_channels[data.channel_id].messages) current_channels[data.channel_id].messages.push(data)
                current_channels[data.channel_id].last_message = data.create_time

                return { ...current_channels }
            })
        }

        socket.on("message", onMessage)
        return () => socket.off("message", onMessage)
    }, [])

    useEffect(() => {
        if (Object.keys(channels).length) return

        apiGet("userChannels", "@me").then(res => {
            if (res.message !== "200 OK") return setFlash("Couldn't load channels!", "error")
            if (!res.user_channels) return

            setChannels(res.user_channels)
        }).then(() => {
            setTimeout(() => {
                const loading_screen_wrapper = document.getElementById("loading-screen-wrapper")
                if (!loading_screen_wrapper) return

                loading_screen_wrapper.classList.add("deactivate")
                setTimeout(() => {
                    if (!loading_screen_wrapper) return
                    loading_screen_wrapper.innerHTML = null;
                    loading_screen_wrapper.remove()
                }, 170)
            }, 250)
        })
    }, [])

    return (
        <ChannelContext.Provider value={[channels, setChannels]}>
            {children}
        </ChannelContext.Provider>
    )
}