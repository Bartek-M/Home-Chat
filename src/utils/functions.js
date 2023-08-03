import { apiSend, apiDelete } from "./"
export const { os_list, version } = require("../data/config.json")

// Set userOS
export const userOS = (() => {
    for (const os in os_list) {
        if (window.navigator.userAgent.indexOf(os) != -1) return os_list[os]
    }
})()

// Theme
export function preferredTheme() {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.setAttribute("data-theme", "dark")
    else document.documentElement.setAttribute("data-theme", "light")
}

export function appTheme(theme) {
    if (theme === "dark" || theme === "light") return document.documentElement.setAttribute("data-theme", theme)
    preferredTheme()
}

// Smooth scroll
export function smoothScroll(element) {
    if (!element) return
    element.scrollBy({ top: element.scrollHeight - element.clientHeight })
}

// Open DM channel
export function openChannel(button, channels, friend_id, setActive, close, setFlash, setSettings) {
    if (!friend_id) return

    apiSend(button, "channelOpen", { friend: friend_id }, "POST").then(res => {
        if (res.errors && res.errors.friend) return setFlash(res.errors.friend, "error")

        if (res.message == "200 OK" && res.channel) {
            setActive({ channel: channels[res.channel.id] })
            close()

            if (setSettings) setSettings(false)
            return
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

// Add friend
export function addFriend(button, friend, setFlash) {
    if (!friend) return

    apiSend(button, "addFriend", { friend: friend.id }, "POST", "@me").then(res => {
        if (res.errors) return setFlash(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") return setFlash("Friend request sent")

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

// Delete message
export function deleteMessage(button, channel_id, message_id, setFlash, close) {
    apiDelete(button, "messageDelete", [channel_id, message_id]).then(res => {
        if (res.errors) {
            if (res.errors.channel) return setFlash(res.errors.channel, "error")
            if (res.errors.message) return setFlash(res.errors.message, "error")
        }
        
        if (res.message === "200 OK") {
            if (close) close()
            return setFlash("Message Deleted")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}