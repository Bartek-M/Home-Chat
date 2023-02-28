import React from "react"

// App version
const version = "9bc69ac"

// User Data
const UserContext = React.createContext(null)


// API
const api_pages = {
    channel: (value) => `/api/channels/${value}/`,
    channel_users: (value) => `/api/channels/${value}/users/`,
    channel_messages: (value) => `/api/channels/${value}/messages/`,
    user: (value) => `/api/users/${value}/`,
    user_channels: (value) => `/api/users/${value}/channels/`,
    user_friends: (value) => `/api/users/${value}/friends/`,
    user_settings: (value) => `/api/users/${value}/settings/`
}

async function api_get(page, id) {
    return await fetch(api_pages[page](id))
        .then((response) => { return response.json() })
        .then((data) => { return data })
}

async function api_send(page, id, data) {
    return await fetch(api_pages[page](id), {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}


// OS
const os_list = {
    "Windows NT 10.0": "Windows 10",
    "Windows NT 6.2": "Windows 8",
    "Windows NT 6.1": "Windows 7",
    "Windows NT 6.0": "Windows Vista",
    "Windows NT 5.1": "Windows XP",
    "Windows NT 5.0": "Windows 2000",
    "Mac": "Mac / iOS",
    "X11": "UNIX",
    "Linux": "Linux"
}

const user_os = (() => {
    for (const os in os_list) {
        if (window.navigator.userAgent.indexOf(os) != -1) return os_list[os]
    }
})()


// Convert EPOCH time to local
function format_time(time, format = "full") {
    time = parseFloat(time)

    if (format == "full") {
        return new Date(time * 1000).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replaceAll(",", "")
    }

    if (format == "time") {
        return new Date(time * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    }

    return undefined
}

// Smooth scroll
function smooth_scroll(id) {
    var div = document.getElementById(id)
    div.scrollBy(0, div.scrollHeight - div.clientHeight)
}

// Copy text
async function copy_text(text) {
    await window.navigator.clipboard.writeText(text).catch(() => { })
}

// Flash message
function flash_message(text, type = "info") {
    if (type == "info") {
        var icon = `
        <svg width="20" height="20" fill="#3ba55c" viewBox="0 0 16 16">
            <path stroke="#3ba55c" stroke-width="2" d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
        </svg>
        `
    } else if (type == "error") {
        var icon = `
        <svg width="16" height="16" fill="#c24246" viewBox="0 0 16 16">
            <path stroke="#c24246" stroke-width="2" fill-rule="evenodd" clip-rule="evenodd" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
        </svg>
        `
    }

    let id = text.toLowerCase().replaceAll(" ", "")

    if (!document.getElementById(id)) {
        document.getElementById("flash-box").innerHTML += `
        <div class="flash-message container" id="${id}">
            ${icon}
            <p>${text}</p>
        </div>
        `
        setTimeout(() => { document.getElementById(id).remove() }, 3000)
    }
}


// Overlay
function overlay_open(element) {
    overlay_close()

    element.classList.add("active")
    document.getElementById("overlay").classList.add("active")
}

function overlay_close() {
    document.querySelectorAll(".active").forEach(element => { element.classList.remove("active") })
    document.getElementById("overlay").classList.remove("active")
}


// EXPORTS
export {
    UserContext,
    version,
    user_os,
    api_get,
    api_send,
    format_time,
    smooth_scroll,
    copy_text,
    flash_message,
    overlay_open,
    overlay_close
}