import { api_send, flash_message } from "./"
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
export function open_channel(friend_id, setChannels, close) {
    if (!friend_id) return

    api_send("channel_open", { friend: friend_id }, "POST").then(res => {
        if (res.errors && res.errors.friend) return flash_message(res.errors.friend)

        if (res.message == "200 OK") {
            setChannels(channels => {
                if (!channels.some(({id}) => id === res.channel.id)) channels.push(res.channel)
                return channels
            })

            return close()
        }

        flash_message("Something went wrong!", "error")
    })
}