// Connect
var socket = io()
socket.on("connect", () => { socket.emit("connecting", user_id) })


// Update messages
socket.on("message response", (data) => {
    var { author_name, content, time } = data

    document.getElementById("messages-win").innerHTML += `<div class="message"> <div class="message-author">${author_name}</div> <div class="message-content">${content}</div> <div class="message-data">${time}</div> </div>`
})


// Send a message
const send_btn = document.getElementById("message-send")
const message_inpt = document.getElementById("message-inpt")

send_btn.addEventListener("click", () => { send() })
message_inpt.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.keyCode === 13) { send() } })

function send() {
    let text = message_inpt.value

    if (text.length) {
        socket.emit("message send", {user_id: user_id, content: text})
        message_inpt.value = ""
    }
}