// Connect
const socket = io()

// Update messages
var messages = {}

socket.on("message recive", (data) => {
    var { id, channel_id, author, content, time } = data

    var repeat = false
    if (messages[channel_id]) {
        if (messages[channel_id][0] == author.id & (time - messages[channel_id][1]) < 360) { repeat = true }
    }

    if (!repeat) {
        var content =
            `<li class="message-list-item" id="chat-messages-${channel_id}-${id}>">` +
            `<img class="avatar" src="https://avatarfiles.alphacoders.com/168/168291.png"/>` +
            '<div class="message-content">' +
            `<div class="message-info"><p class="message-author">${author.name}</p><p class="message-time">${format_time(time)}<p></div>` +
            `<div class="message-text">${content}</div>` +
            '</div></li>'
    } else {
        var content =
            `<li class="message-list-item repeated-message-list-item" id="chat-messages-${channel_id}-${id}>">` +
            `<div class="message-hidden-time">${format_time(time, "time")}</div>` +
            '<div class="message-content">' +
            `<div class="message-text">${content}</div>` +
            '</div></li>'
    }

    document.getElementById("messages-list").innerHTML += content
    smooth_scroll("chat-window")

    messages[channel_id] = [author.id, time]
})

// Send a message
const send_btn = document.getElementById("message-send")
const message_inpt = document.getElementById("message-inpt")

send_btn.addEventListener("click", () => { send() })
message_inpt.addEventListener("keypress", (e) => {
    if (e.key === "Enter" & !e.shiftKey) { send(); e.preventDefault() }
})

function send() {
    let text = message_inpt.innerText.trim()
    if (text.length) { socket.emit("message send", { user_id: user_id, content: text }) }
    message_inpt.innerText = ""
}