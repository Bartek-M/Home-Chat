import React, { useState, useContext, useEffect } from "react"
import { useParams } from "react-router-dom";

import { useChannels } from ".";

const ActiveContext = React.createContext()
export function useActive() { return useContext(ActiveContext) }

export function ActiveProvider({ children }) {
    const [active, setActiveState] = useState({ channel: null, user: null })
    const [channels,] = useChannels()

    var { id } = useParams()

    const setActive = ({ channel, user }) => setActiveState(current_active => {
        if ((channel && !current_active.channel) || ((channel && current_active.channel) && current_active.channel.id !== channel.id)) window.history.replaceState(null, "", `/channels/${channel.id}`)
        if (channel === null) window.history.replaceState(null, "", `/`)

        return {
            channel: (channel || channel === null) ? channel : current_active.channel,
            user: (user || user === null) ? user : current_active.user
        }
    })

    useEffect(() => {
        if (!active.channel && channels.length) {
            const channel = channels.find(channel => channel.id === id)

            if (channel) setActive({ channel: channel })
            else setActive({ channel: channels[0] })

            return
        }

        if (!channels.length) return setActive({ channel: null })
        if (channels.length && !channels.find(channel => channel.id === active.channel.id)) return setActive({ channel: channels[0] })
    }, [active.channel, channels])

    return (
        <ActiveContext.Provider value={[active, setActive]}>
            {children}
        </ActiveContext.Provider>
    )
}