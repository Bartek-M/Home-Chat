import React, { useState, useContext, useEffect } from "react"
import { api_get, flash_message } from "../utils/";

const ChannelContext = React.createContext()
export function useChannels() { return useContext(ChannelContext) }

export function ChannelsProvider({ children }) {
    const [channels, setChannels] = useState(null)

    useEffect(() => {
        if (channels) return

        api_get("user_channels", "@me").then(res => {
            if (res.message !== "200 OK") return flash_message("Couldn't load channels!", "error")
            if (res.user_channels === undefined) return

            setChannels(res.user_channels ? res.user_channels : [])
        })
    })

    return (
        <>
            <Loading />
            {channels && <>
                <ChannelContext.Provider value={[channels, setChannels]}>
                    {children}
                </ChannelContext.Provider>
            </>}
        </>
    )
}