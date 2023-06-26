import { apiSend } from "./"
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
    element.scrollBy(0, element.scrollHeight - element.clientHeight)
}

// Open DM channel
export function openChannel(button, friend_id, setChannels, setActive, close, setFlash, setSettings) {
    if (!friend_id) return

    apiSend(button, "channelOpen", { friend: friend_id }, "POST").then(res => {
        if (res.errors && res.errors.friend) return setFlash(res.errors.friend, "error")

        if (res.message == "200 OK" && res.channel) {
            setChannels(current_channel => {
                current_channel[res.channel.id] = res.channel
                return current_channel
            })

            setActive({ channel: res.channel })

            close()
            if (setSettings) setSettings(false)
            return
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

// Add friend
export function addFriend(button, user_id, friend, setFriends, setFlash) {
    if (!friend) return

    apiSend(button, "addFriend", { friend: friend.id }, "POST", "@me").then(res => {
        if (res.errors) return setFlash(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")

        if (res.message === "200 OK") {
            friend.accepted = "waiting"
            friend.inviting = user_id
            setFriends(current_friends => {
                if (current_friends.pending && current_friends.pending.some(({ id }) => id === friend.id)) return current_friends
                if (current_friends.pending) return { ...current_friends, pending: [friend, ...current_friends.pending] }

                return { ...current_friends, pending: [friend] }
            })
            return setFlash("Friend request sent")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}