// BUTTONS
const open_channel_btns = document.querySelectorAll("[open-channel-btn]")
open_channel_btns.forEach(button => { button.addEventListener("click", () => open_channel(button.id.replace("channel-button-", ""))) })

// CHANNELS & MESSAGES
var opened
var messages
var send_btn
var message_inpt


// Add message
function add_message(message) {
    var { id, channel_id, author, content, time } = message
    time = parseFloat(time)

    var repeat = false
    if (messages[channel_id] && messages[channel_id][0] == author.id && (time - messages[channel_id][1]) < 360) { repeat = true }

    if (!repeat) {
        var content = `
        <li class="message-list-item container" id="chat-messages-${channel_id}-${id}>">
            <img class="avatar" src="/api/photos/${author.avatar}.webp"/>
            <div class="message-content">
                <div class="message-info container">
                    <p class="message-author">${author.name}</p>
                    <p class="message-time">${format_time(time)}<p>
                </div>
                <div class="message-text">${content}</div>
            </div>
        </li>`
    } else {
        var content = `
        <li class="message-list-item repeated-message-list-item container" id="chat-messages-${channel_id}-${id}>">
            <div class="message-hidden-time all-center-container">${format_time(time, "time")}</div>
            <div class="message-content">
                <div class="message-text">${content}</div>
            </div>
        </li>`
    }

    messages[channel_id] = [author.id, time]
    return content
}

// Display channel
async function open_channel(channel_id) {
    if (channel_id === opened) { return }
    var message_list = await api_get("channel_messages", channel_id)

    if (opened) {
        document.getElementById(`channel-pill-${opened}`).style = ""
        document.getElementById(`channel-button-${opened}`).children[0].style = ""
    }

    opened = channel_id
    messages = []
    var fetched_users = {}

    document.getElementById(`channel-pill-${channel_id}`).style.height = "40px"
    document.getElementById(`channel-button-${channel_id}`).children[0].style.borderRadius = "10px"

    document.getElementsByClassName("main-view")[0].innerHTML = `
    <div class="channel-title spaced-container">
        <div class="all-center-container">
            <img class="channel-icon" src="/api/photos/123456789.webp"/>
            <p class="channel-name">${channel_id}</p>
        </div>
        <button class="all-center-container" id="channel-settings">
            <svg width="28" height="28" viewBox="0 0 16 16">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
        </button>
    </div>
    <div class="column-container scroller-container" id="chat-window">
        <div id="messages-list"></div>
        <div class="scroller-spacer"></div>
    </div>
    <div class="writing-box container" id="message-form">
        <span class="scroller-container" id="message-inpt" contenteditable></span>
        <input id="message-send" type="submit" value="SEND"/>
    </div>
`

    let messages_list_items = ``

    for (const message of message_list) {
        if (fetched_users[message.user_id]) { message.author = fetched_users[message.user_id] }
        else { message.author = await api_get("user", String(message.user_id)); fetched_users[message.user_id] = message.author }

        message.time = message.create_time

        delete message.user_id
        delete message.create_time

        messages_list_items += add_message(message)
    }

    document.getElementById("messages-list").innerHTML += messages_list_items
    smooth_scroll("chat-window")

    send_btn = document.getElementById("message-send")
    message_inpt = document.getElementById("message-inpt")

    send_btn.addEventListener("click", () => { send() })
    message_inpt.addEventListener("keypress", (e) => { if (e.key === "Enter" & !e.shiftKey) { send(); e.preventDefault() } })
}


// SOCKETS
// Connect
const socket = io()

// Update messages
socket.on("message recive", (data) => {
    document.getElementById("messages-list").innerHTML += add_message(data)
    smooth_scroll("chat-window")
})

// Send a message
function send() {
    let text = message_inpt.innerText.trim()

    if (text.length) { socket.emit("message send", { user_id: user_id, channel_id: opened, content: text }) }
    message_inpt.innerText = ""
}