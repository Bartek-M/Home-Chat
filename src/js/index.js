console.log("Hello from backend :)")

// OBJECTS
// Set auto theme
const prefered_theme = window.matchMedia("(prefers-color-scheme: dark)")

function set_prefered_theme() {
    if (prefered_theme.matches) { document.documentElement.setAttribute("data-theme", "dark") }
    else { document.documentElement.setAttribute("data-theme", "light") }
}

set_prefered_theme()
prefered_theme.addEventListener("change", () => { if (!settings || settings.theme == "auto") set_prefered_theme() })

// Get os
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
var user_os
for (const os in os_list) { if (window.navigator.userAgent.indexOf(os) != -1) { user_os = os_list[os] } }


// OVERLAY
const main_overlay = document.getElementById("overlay-main") // Main Overlay
const secnd_overlay = document.getElementById("overlay-secnd") // Secondary overlay

document.querySelectorAll("[all-close]").forEach((element) => element.addEventListener("click", () => { overlay_close(main_overlay) })) // All closing elements
document.querySelectorAll("[high-close]").forEach((element) => element.addEventListener("click", () => { overlay_close(secnd_overlay) })) // Secondary closing elements


// Active elements
var active = { main: [], secnd: [] }

function overlay_open(overlay, element) {
    overlay_close(overlay)

    element.classList.add("active")
    overlay.classList.add("active")

    if (overlay == main_overlay) { active.main.push(element) }
    else { active.secnd.push(element) }
}

function overlay_close(overlay) {
    if (overlay == main_overlay) {
        active.main.forEach(element => { element.classList.remove("active") })
        active.main = []
        overlay.classList.remove("active")
    }

    active.secnd.forEach(element => { element.classList.remove("active") })
    active.secnd = []
    secnd_overlay.classList.remove("active")
}

document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        if (active.secnd.length) { overlay_close(secnd_overlay) }
        else { overlay_close(main_overlay) }
    }
})


// GLOBAL FUNCTIONS
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

async function copy_text(text) {
    await window.navigator.clipboard.writeText(text).catch(() => { })
}


// API FUNCTIONS
const API_PAGES = {
    connection_verify: (value) => `/api/connection/${value}`,
    channel: (value) => `/api/channels/${value}/`,
    channel_users: (value) => `/api/channels/${value}/users/`,
    channel_messages: (value) => `/api/channels/${value}/messages/`,
    user: (value) => `/api/users/${value}/`,
    user_channels: (value) => `/api/users/${value}/channels/`,
    user_friends: (value) => `/api/users/${value}/friends/`,
    user_settings: (value) => `/api/users/${value}/settings/`
}

async function api_me() { return await api_get("user", "@me") }
async function api_settings() { return await api_get("user_settings", "@me") }

async function api_get(page, id) {
    return await fetch(API_PAGES[page](id))
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}

async function api_send(page, id, data) {
    return await fetch(API_PAGES[page](id), {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}