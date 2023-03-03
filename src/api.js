import React from "react"

// User Data
const UserContext = React.createContext(null)


// API
const api_pages = {
    channel: (value) => `/api/channels/${value}/`,
    channel_users: (value) => `/api/channels/${value}/users/`,
    channel_messages: (value) => `/api/channels/${value}/messages/`,
    user: (value) => `/api/users/${value}/`,
    user_channels: (value) => `/api/users/${value}/channels/`,
    user_friends: (value) => `/api/users/${value}/friends/`,
    user_settings: (value) => `/api/users/${value}/settings/`
}

async function api_get(page, id) {
    return await fetch(api_pages[page](id))
        .then((response) => { return response.json() })
        .then((data) => { return data })
}

async function api_send(page, id, data) {
    return await fetch(api_pages[page](id), {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}


export {
    UserContext,
    api_get,
    api_send
}