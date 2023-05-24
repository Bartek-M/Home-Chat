import React, { useState, useContext, useEffect } from "react"
import { useParams } from "react-router-dom";
import { api_get, flash_message } from "../utils/";

const ChannelContext = React.createContext()
export function useChannels() { return useContext(ChannelContext) }

export function ChannelsProvider({ children }) {
    const [channels, setChannels] = useState([])
    const { id } = useParams()

    useEffect(() => {
        if (channels.length) return

        api_get("user_channels", "@me").then(res => {
            if (res.message !== "200 OK") return flash_message("Couldn't load channels!", "error")
            if (res.user_channels === undefined) return
            
            if (!res.user_channels) return
            
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