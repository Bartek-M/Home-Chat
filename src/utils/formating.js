// Generate 16 letter secret code
const base32_alph = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

export function genSecret() {
    let secret = ""
    let formatted = ""

    for (let i = 0; i < 16; i++) {
        let char = base32_alph[Math.floor(Math.random() * base32_alph.length)]
        if (i % 4 === 0 && i != 0) formatted += "-"

        secret += char
        formatted += char
    }

    return [secret, formatted]
}

// Convert EPOCH time to local
export function formatTime(time, format = "full") {
    time = parseFloat(time)
    let date = new Date(time * 1000)

    if (format === "full") { date = date.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replaceAll(",", "") }
    if (format === "time") { date = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }
    if (format === "date") { date = date.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) }

    return date
}
