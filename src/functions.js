// App version
const version = "495219e"

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

// THEME
function prefered_theme() {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.setAttribute("data-theme", "dark")
    else document.documentElement.setAttribute("data-theme", "light")
}

function app_theme(theme) {
    if (theme === "dark" || theme === "light") return document.documentElement.setAttribute("data-theme", theme)
    prefered_theme()
}


// Convert EPOCH time to local
function format_time(time, format = "full") {
    time = parseFloat(time)
    let date = new Date(time * 1000)

    if (format === "full") { date = date.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replaceAll(",", "") }
    if (format === "time") { date = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }

    return date
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
    if (type === "error") {
        var icon = `
            <svg width="16" height="16" fill="#c24246" viewBox="0 0 16 16">
                <path stroke="#c24246" stroke-width="2" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
            </svg>
        `
    } else {
        var icon = `
            <svg width="20" height="20" fill="#3ba55c" viewBox="0 0 16 16">
                <path stroke="#3ba55c" stroke-width="2" d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
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
    element.classList.add("overlay")
    if (element.id !== "settings") document.getElementById("overlay").classList.add("overlay")
}

function overlay_close() {
    let elements = document.querySelectorAll(".overlay")

    elements.forEach(element => {
        if (elements.length !== 1 && element.id === "settings") return
        element.classList.remove("overlay")
    })
}


// EXPORTS
export {
    version,
    user_os,
    prefered_theme,
    app_theme,
    format_time,
    smooth_scroll,
    copy_text,
    flash_message,
    overlay_open,
    overlay_close
}