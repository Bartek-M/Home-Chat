// API
const API_PAGES = {
    auth_login: () => `auth/login`,
    auth_register: () => `auth/register`,
    auth_verify: () => `auth/verify`,

    channel: (value) => `channels/${value}`,
    channel_users: (value) => `channels/${value}/users`,
    channel_messages: (value) => `channels/${value}/messages`,

    channel_open: () => `channels/open`,
    channel_create: () => `channels/create`,

    channel_settings: (value) => `channels/${value}/settings`,
    channel_leave: (value) => `channels/${value}/leave`,
    channel_delete: (value) => `channels/${value}/delete`,

    user: (value) => `users/${value}`,
    user_search: () => `users/search`,
    user_channels: (value) => `users/${value}/channels`,
    user_settings: (value) => `users/${value}/settings`,

    user_mfa: (value) => `users/${value}/settings/mfa`,
    user_delete: (value) => `users/${value}/delete`,

    user_friends: (value) => `users/${value}/friends`,
    addFriend: (value) => `users/${value}/friends/add`,
    removeFriend: (value) => `users/${value}/friends/remove`,
    confirmFriend: (value) => `users/${value}/friends/confirm`,
    declineFriend: (value) => `users/${value}/friends/decline`,

    notifications: (value) => `users/${value}/notifications`,

    avatar: () => `images/avatar`,
    icon: (value) => `images/icon/${value}`
}

export async function apiGet(page, id) {
    return await fetch(`/api/${API_PAGES[page](id)}/`, {
        headers: { "Authentication": localStorage.getItem("token") }
    })
        .then((response) => { return response.json() })
        .then((data) => { return data })
}

export async function apiSend(button, page, data, method, id = null) {
    button.disabled = true

    return await fetch(`/api/${API_PAGES[page](id)}/`, {
        method: method,
        headers: {
            "Content-type": "application/json",
            "Authentication": localStorage.getItem("token")
        },
        body: JSON.stringify(data)
    })
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
        .finally(() => button.disabled = false)
}

export async function apiDeletee(button, page, id) {
    button.disabled = true

    return await fetch(`/api/${API_PAGES[page](id)}/`, {
        method: "DELETE",
        headers: { "Authentication": localStorage.getItem("token") }
    })
        .then((response) => { return response.json() })
        .then((data) => { return data })
        .finally(() => button.disabled = false)
}

export async function apiFile(page, data, id = null) {
    return await fetch(`/api/${API_PAGES[page](id)}/`, {
        method: "POST",
        headers: { "Authentication": localStorage.getItem("token") },
        body: data
    })
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}