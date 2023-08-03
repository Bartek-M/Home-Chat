const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

// Generate 16 letter secret code
export function genSecret() {
    let secret = ""
    let formatted = ""

    for (let i = 0; i < 16; i++) {
        let char = BASE32[Math.floor(Math.random() * BASE32.length)]
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

// Format message with links
export function formatMessage(content) {
    return !content.match(URL_REGEX)
        ? content
        : content.split(" ").map((part, index) => {
            return URL_REGEX.test(part)
                ? <span key={index}><a className="link" target="_blank" href={part.toLowerCase().startsWith('http') ? part : `//${[part]}`}>{part}</a> </span>
                : part + " "
        })
}