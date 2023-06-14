import { apiSend } from "./"
export const { os_list, version } = require("../data/config.json")

// Set user_os
export const user_os = (() => {
    for (const os in os_list) {
        if (window.navigator.userAgent.indexOf(os) != -1) return os_list[os]
    }
})()

// Theme
export function prefered_theme() {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.setAttribute("data-theme", "dark")
    else document.documentElement.setAttribute("data-theme", "light")
}

export function app_theme(theme) {
    if (theme === "dark" || theme === "light") return document.documentElement.setAttribute("data-theme", theme)
    prefered_theme()
}

// Smooth scroll
export function smooth_scroll(id) {
    var div = document.getElementById(id)
    div.scrollBy(0, div.scrollHeight - div.clientHeight)
}

// Copy text
export async function copy_text(text) {
    await window.navigator.clipboard.writeText(text).catch(() => { })
}

// Open DM channel
export function openChannel(button, friend_id, setChannels, close, setFlash, setSettings) {
    if (!friend_id) return

    apiSend(button, "channelOpen", { friend: friend_id }, "POST").then(res => {
        if (res.message === "429 Too Many Requests") return setFlash("Too many requests", "error")
        if (res.errors && res.errors.friend) return setFlash(res.errors.friend, "error")

        if (res.message == "200 OK" && res.channel) {
            setChannels(channels => {
                if (!channels.some(({ id }) => id === res.channel.id)) channels.unshift(res.channel)

                return channels.filter(channel => {
                    if (channel.active) channel.active = false
                    if (channel.id === res.channel.id) channel.active = true

                    return channel
                })
            })

            close()
            if (setSettings) setSettings(false)

            return window.history.replaceState(null, "", `/channels/${res.channel.id}`)
        }

        setFlash("Something went wrong!", "error")
    })
}