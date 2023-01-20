console.log("Hello from backend :)")

// GLOBAL ELEMENTS
const ovelay = document.getElementById("overlay") // Overlay

const top_menu = document.getElementById("top-dropdown-menu") // Top dropdown menu
const top_btn = document.getElementById("top-dropdown-btn") // Top dropdown button
const top_close = document.getElementById("top-menu-close") // Top dropdown menu close button

const settings = document.getElementById("settings-page")
const open_settings = document.getElementById("open-settings") // Open settings button
const close_settings = document.getElementById("close-settings") // Close settings button

var active = [] // Active elements


// Overlay open and close
function overlay_open(element) {
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
top_close.addEventListener("click", () => { overlay_close() });

if (open_settings || close_settings) {
    open_settings.addEventListener("click", () => { overlay_open(settings) })
    close_settings.addEventListener("click", () => { overlay_close() })
}

ovelay.addEventListener("click", () => { overlay_close() })


// GLOBAL FUNCTIONS

// Convert EPOCH time to local
function time(epoch) {

}