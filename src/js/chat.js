// Connect
var socket = io()
socket.on("connect", () => { socket.emit("connecting", user_id) })


// Update messages
socket.on("message recive", (data) => {
    var { id, channel_id, author, content, time} = data
    var content =
        `<li class="message-list-item" id="chat-message-${channel_id}-${id}>">` +

        '<div class="message-author-icon">' +
        `<img src="https://avatarfiles.alphacoders.com/168/168291.png"/>` +
        '</div>' +

        '<div class="message-content">' +
        '<div class="message-info">' +
        `<p class="message-author">${author.name}</p><p class="message-time">${time}<p>` +
        '</div>' +

        '<div class="message-text">' +
        `${content}` +
        '</div>' +
        '</div>' +
        '</li>'

    document.getElementById("messages-window-box").innerHTML += content
})


// Send a message
const send_btn = document.getElementById("message-send")
const message_inpt = document.getElementById("message-inpt")

send_btn.addEventListener("click", () => { send() })
message_inpt.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.keyCode === 13) { send() } })

function send() {
    let text = message_inpt.innerText

    if (text.length) {
        socket.emit("message send", { user_id: user_id, content: text })
        message_inpt.innerText = ""
    }
}