console.log("Hello from backend :)")

// USER OBJECT
var me


// GLOBAL ELEMENTS
const ovelay = document.getElementById("overlay") // Overlay
const all_close = document.querySelectorAll("[all-close]") // All closing elements

const top_menu = document.getElementById("top-dropdown-menu") // Top dropdown menu
const top_btn = document.getElementById("top-dropdown-btn") // Top dropdown button

var active = [] // Active elements


// Overlay open and close
function overlay_open(element) {
    overlay_close()

    element.classList.add("active")
    ovelay.classList.add("active")
    active.push(element)
}

function overlay_close() {
    active.forEach(element => { element.classList.remove("active") })
    active = []
    ovelay.classList.remove("active")
}


// BUTTONS
top_btn.addEventListener("click", () => { overlay_open(top_menu); });

all_close.forEach((element) => element.addEventListener("click", () => { overlay_close() }))
document.addEventListener("keyup", (e) => { if (e.key === "Escape") overlay_close() })


// GLOBAL FUNCTIONS
// Convert EPOCH time to local
function format_time(time, format = "full") {
    time = parseFloat(time)

    if (format == "full") { return new Date(time * 1000).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replaceAll(",", "") }
    if (format == "time") { return new Date(time * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }

    return undefined
}

// Smooth scroll
function smooth_scroll(id) {
    var div = document.getElementById(id)
    div.scrollBy(0, div.scrollHeight - div.clientHeight)
}

async function copy_text(text) {
    await navigator.clipboard.writeText(text).catch(() => {})
}


// API FUNCTIONS
async function get_me() {
    if (!me) { me = await get_user("@me") }

    return me
}

// Get channel messages
async function get_channel_messages(channel_id) {
    return await fetch(`/api/channels/${channel_id}/messages/`)
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}

// Get user channels
async function get_user_channels(user_id) {
    return await fetch(`/api/users/${user_id}/channels/`)
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}

// Get user
async function get_user(user_id) {
    return await fetch(`/api/users/${user_id}/`)
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}

// Get channel
async function get_channel(channel_id) {
    return await fetch(`/api/channels/${channel_id}/`)
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}