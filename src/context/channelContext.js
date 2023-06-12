import React, { useState, useContext, useEffect } from "react"
import { useParams } from "react-router-dom";

import { apiGet } from "../utils";
import { useFlash } from ".";

const ChannelContext = React.createContext()
export function useChannels() { return useContext(ChannelContext) }

export function ChannelsProvider({ children }) {
    const [channels, setChannels] = useState([])
    const setFlash = useFlash()

    const { id } = useParams()

    useEffect(() => {
        if (channels.length) return

        apiGet("userChannels", "@me").then(res => {
            if (res.message === "429 Too Many Requests") return setFlash("Too many requests", "error")

            if (res.message !== "200 OK") return setFlash("Couldn't load channels!", "error")
            if (!res.user_channels || !res.user_channels.length) return true

            if (id && res.user_channels.find(channel => channel.id === id)) {
                res.user_channels.filter(channel => {
                    if (channel.id === id) channel.active = true
                    return channel
                })
            } else {
                res.user_channels[0].active = true
                window.history.replaceState(null, "", `/channels/${res.user_channels[0].id}`)
            }

            setChannels(res.user_channels)
        }).then(() => {
            setTimeout(() => {
                const loading_screen_wrapper = document.getElementById("loading-screen-wrapper")
                if (!loading_screen_wrapper) return

                loading_screen_wrapper.classList.add("deactive")
                setTimeout(() => {
                    if (!loading_screen_wrapper) return
                    loading_screen_wrapper.innerHTML = null;
                    loading_screen_wrapper.remove()
                }, 170)
            }, 250)
        })
    })

    return (
        <ChannelContext.Provider value={[channels, setChannels]}>
            {children}
        </ChannelContext.Provider>
    )
}