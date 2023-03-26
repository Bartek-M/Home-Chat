import React from "react"

// User Data
const UserContext = React.createContext(null)


// API
const api_pages = {
    auth_login: () => `api/auth/login`,
    auth_register: () => `api/auth/register`,
    auth_verify: () => `api/auth/verify`,

    channel: (value) => `/api/channels/${value}/`,
    channel_users: (value) => `/api/channels/${value}/users/`,
    channel_messages: (value) => `/api/channels/${value}/messages/`,

    user: (value) => `/api/users/${value}/`,
    user_channels: (value) => `/api/users/${value}/channels/`,
    user_friends: (value) => `/api/users/${value}/friends/`,
    user_settings: (value) => `/api/users/${value}/settings/`,

    avatar: () => `/api/images/avatar/`
}

async function api_get(page, id) {
    return await fetch(api_pages[page](id), {
        headers: { "Authentication": localStorage.getItem("token") }
    })
        .then((response) => { return response.json() })
        .then((data) => { return data })
}

async function api_send(page, data, id = null) {
    return await fetch(api_pages[page](id), {
        method: id ? "PATCH" : "POST",
        headers: {
            "Content-type": "application/json",
            "Authentication": localStorage.getItem("token")
        },
        body: JSON.stringify(data)
    })
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}

async function api_file_upload(page, data) {
    return await fetch(api_pages[page](), {
        method: "POST",
        headers: { "Authentication": localStorage.getItem("token") },
        body: data
    })
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}


export {
    UserContext,
    api_get,
    api_send,
    api_file_upload
}