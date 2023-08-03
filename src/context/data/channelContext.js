import React, { useState, useContext, useEffect } from "react"

import { apiGet } from "../../utils";
import { useFlash, useSocket, useUser } from "..";

const ChannelContext = React.createContext()
export function useChannels() { return useContext(ChannelContext) }

export function ChannelsProvider({ children }) {
    const [user,] = useUser()
    const [channels, setChannels] = useState({})
    const setFlash = useFlash()

    const socket = useSocket()

    useEffect(() => {
        const onMessage = (data) => {
            if (!data || !data.id) return

            setChannels(current_channels => {
                if (!current_channels[data.channel_id]) return current_channels

                if (current_channels[data.channel_id].messages) current_channels[data.channel_id].messages.push(data)
                current_channels[data.channel_id].last_message = data.create_time

                return { ...current_channels }
            })
        }

        const onMessageEdit = (data) => {
            if (!data || !data.id) return

            setChannels(current_channels => {
                if (!current_channels[data.channel_id]) return current_channels

                if (!current_channels[data.channel_id].messages) return current_channels
                current_channels[data.channel_id].messages = current_channels[data.channel_id].messages.filter(fltr_message => {
                    if (fltr_message.id === data.id) fltr_message.content = data.content
                    return fltr_message
                })

                return { ...current_channels }
            })
        }

        const onMessageDelete = (data) => {
            if (!data || !data.channel_id || !data.message_id) return

            setChannels(current_channels => {
                if (!current_channels[data.channel_id]) return current_channels

                if (!current_channels[data.channel_id].messages) return current_channels
                current_channels[data.channel_id].messages = current_channels[data.channel_id].messages.filter(fltr_message => fltr_message.id !== data.message_id)

                return { ...current_channels }
            })
        }

        const onChannelInvite = (data) => {
            if (!data || !data.id) return

            setChannels(current_channels => {
                if (current_channels[data.id]) return current_channels
                current_channels[data.id] = data

                return { ...current_channels }
            })
        }

        const onChannelDelete = (data) => {
            if (!data.channel_id) return

            setChannels(current_channels => {
                if (!current_channels[data.channel_id]) return current_channels

                delete current_channels[data.channel_id]
                return { ...current_channels }
            })
        }

        const onChannelChange = (data) => {
            const channel_id = data.channel_id
            const setting = data.setting
            const content = data.content

            if (!channel_id || !setting || content === undefined) return

            setChannels(current_channels => {
                if (!current_channels[channel_id]) return current_channels
                if (current_channels[channel_id][setting] === content) return current_channels

                current_channels[channel_id][setting] = content
                return { ...current_channels }
            })
        }

        const onMemberChange = (data) => {
            const channel_id = data.channel_id
            const member_id = data.member_id
            const setting = data.setting
            const content = data.content

            if (!channel_id || !member_id || !setting || content === undefined) return

            setChannels(current_channels => {
                if (!current_channels[channel_id] || !current_channels[channel_id].users[member_id]) return current_channels

                if (setting === "nick" && user.id !== member_id && current_channels[channel_id].direct) current_channels[channel_id].display_name = content
                if (user.id === member_id) current_channels[channel_id][setting] = content

                current_channels[channel_id].users[member_id][setting] = content
                return { ...current_channels }
            })
        }

        const onMemberList = (data) => {
            const channel_id = data.channel_id
            const member = data.member
            const action = data.action

            if (!channel_id || !member || !action) return
            if (!["add", "remove"].includes(action)) return

            setChannels(current_channels => {
                if (!current_channels[channel_id]) return current_channels

                if (action === "add") {
                    if (current_channels[channel_id].users[member.id]) return current_channels
                    current_channels[channel_id].users[member.id] = member
                }

                else if (action === "remove") {
                    if (!current_channels[channel_id].users[member]) return current_channels

                    if (member === user.id) delete current_channels[channel_id]
                    else delete current_channels[channel_id].users[member]
                }

                return { ...current_channels }
            })
        }

        socket.on("message", onMessage)
        socket.on("message_edit", onMessageEdit)
        socket.on("message_delete", onMessageDelete)

        socket.on("channel_invite", onChannelInvite)
        socket.on("channel_delete", onChannelDelete)
        socket.on("channel_change", onChannelChange)
        socket.on("member_change", onMemberChange)
        socket.on("member_list", onMemberList)

        return () => {
            socket.off("message", onMessage)
            socket.off("message_edit", onMessageEdit)
            socket.off("message_delete", onMessageDelete)

            socket.off("channel_invite", onChannelInvite)
            socket.off("channel_delete", onChannelDelete)
            socket.off("channel_change", onChannelChange)
            socket.off("member_change", onMemberChange)
            socket.off("member_list", onMemberList)
        }
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