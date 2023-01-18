// Connect
var socket = io()
socket.on("connect", () => { socket.emit("connecting", user_id) })


// Update messages
socket.on("message response", (data) => {
    var { author_name, user_id, message_id, channel_id, content, time } = data
    var content = 
        `<div class="message-list-item" id="chat-message-${channel_id}-${message_id}>">` +
            '<div class="message-info">' +
                `${author_name} • ${time}` +
            '</div>' +
            '<div class="message-content">' +
                `${content}` +
            '</div>' +
        '</div>'

    document.getElementById("messages-win").innerHTML += content
})


// Send a message
const send_btn = document.getElementById("message-send")
const message_inpt = document.getElementById("message-inpt")

send_btn.addEventListener("click", () => { send() })
message_inpt.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.keyCode === 13) { send() } })

function send() {
    let text = message_inpt.value

    if (text.length) {
        socket.emit("message send", { user_id: user_id, content: text })
        message_inpt.value = ""
    }
}