console.log("Hello from backend :)")

// OBJECTS
var me


// GLOBAL ELEMENTS
const main_overlay = document.getElementById("overlay-main") // Main Overlay
const secnd_overlay = document.getElementById("overlay-secnd") // Secondary overlay

const all_close = document.querySelectorAll("[all-close]") // All closing elements
const secnd_close = document.querySelectorAll("[high-close]") // Secondary closing elements

var main_active = [] // Active elements
var secnd_active = [] // Secondary active elements


// Overlay open and close
function main_overlay_open(element) {
    main_overlay_close()
    secnd_overlay_close()

    element.classList.add("active")
    main_overlay.classList.add("active")
    main_active.push(element)
}

function main_overlay_close() {
    main_active.forEach(element => { element.classList.remove("active") })
    main_active = []
    main_overlay.classList.remove("active")
}

function secnd_overlay_open(element) {
    secnd_overlay_close()

    element.classList.add("active")
    secnd_overlay.classList.add("active")
    secnd_active.push(element)
}

function secnd_overlay_close() {
    secnd_active.forEach(element => { element.classList.remove("active") })
    secnd_active = []
    secnd_overlay.classList.remove("active")
}


// BUTTONS
all_close.forEach((element) => element.addEventListener("click", () => { main_overlay_close() }))
secnd_close.forEach((element) => element.addEventListener("click", () => { secnd_overlay_close() }))

document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        if (secnd_active.length) { secnd_overlay_close() }
        else { main_overlay_close() }
    }
})


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
    await navigator.clipboard.writeText(text).catch(() => { })
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