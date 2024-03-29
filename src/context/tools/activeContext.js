import React, { useState, useContext, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom";

import { useChannels } from "..";

const ActiveContext = React.createContext()
export function useActive() { return useContext(ActiveContext) }

export function ActiveProvider({ children }) {
    const [active, setActiveState] = useState({ channel: null, user: null, message: null })
    const [channels,] = useChannels()

    var { id } = useParams()

    const setActive = ({ channel, user, message }) => setActiveState(current_active => {
        if ((channel && !current_active.channel) || ((channel && current_active.channel) && current_active.channel.id !== channel.id)) window.history.replaceState(null, "", `/channels/${channel.id}`)
        if (channel === null) window.history.replaceState(null, "", `/`)

        return {
            channel: (channel || channel === null) ? channel : current_active.channel,
            user: (user || user === null) ? user : current_active.user,
            message: (message || message === null) ? message : current_active.message
        }
    })

    const sortedChannels = useMemo(() => {
        if (!Object.values(channels).length) return []
        return Object.values(channels).sort((a, b) => (b.last_message ? b.last_message : b.join_time) - (a.last_message ? a.last_message : a.join_time))
    }, [Object.keys(channels).length])

    useEffect(() => {
        if (!active.channel && sortedChannels.length) {
            if (channels[id]) setActive({ channel: channels[id] })
            else setActive({ channel: sortedChannels[0] })

            return
        }

        if (!sortedChannels.length) return setActive({ channel: null })
        if (sortedChannels.length && !channels[active.channel.id]) return setActive({ channel: sortedChannels[0] })
    }, [Object.keys(channels).length, active.channel])

    return (
        <ActiveContext.Provider value={[active, setActive]}>
            {children}
        </ActiveContext.Provider>
    )
}