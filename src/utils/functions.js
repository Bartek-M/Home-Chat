import { apiSend } from "./"
export const { os_list, version } = require("../data/config.json")

// Set userOS
export const userOS = (() => {
    for (const os in os_list) {
        if (window.navigator.userAgent.indexOf(os) != -1) return os_list[os]
    }
})()

// Theme
export function preferedTheme() {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.setAttribute("data-theme", "dark")
    else document.documentElement.setAttribute("data-theme", "light")
}

export function appTheme(theme) {
    if (theme === "dark" || theme === "light") return document.documentElement.setAttribute("data-theme", theme)
    preferedTheme()
}

// Smooth scroll
export function smoothScroll(id) {
    var div = document.getElementById(id)
    div.scrollBy(0, div.scrollHeight - div.clientHeight)
}

// Open DM channel
export function openChannel(button, friend_id, setChannels, setActive, close, setFlash, setSettings) {
    if (!friend_id) return

    apiSend(button, "channelOpen", { friend: friend_id }, "POST").then(res => {
        if (res.message === "429 Too Many Requests") return setFlash("Too many requests", "error")
        if (res.errors && res.errors.friend) return setFlash(res.errors.friend, "error")

        if (res.message == "200 OK" && res.channel) {
            setChannels(channels => {
                channels.filter(channel => channel.id !== res.channel.id)
                return [res.channel, ...channels]
            })

            setActive({ channel: res.channel })

            close()
            if (setSettings) setSettings(false)
            return 
        }

        setFlash("Something went wrong!", "error")
    })
}