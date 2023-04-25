// API
const api_pages = {
    auth_login: () => `/api/auth/login/`,
    auth_register: () => `/api/auth/register/`,
    auth_verify: () => `/api/auth/verify/`,

    channel: (value) => `/api/channels/${value}/`,
    channel_users: (value) => `/api/channels/${value}/users/`,
    channel_messages: (value) => `/api/channels/${value}/messages/`,

    channel_open: () => `/api/channels/open/`,
    channel_create: () => `/api/channels/create/`,

    user: (value) => `/api/users/${value}/`,
    user_search: () => `/api/users/search/`,
    user_channels: (value) => `/api/users/${value}/channels/`,
    user_settings: (value) => `/api/users/${value}/settings/`,
    
    user_mfa: (value) => `/api/users/${value}/settings/mfa/`,
    user_delete: (value) => `/api/users/${value}/delete/`,
    
    user_friends: (value) => `/api/users/${value}/friends/`,
    add_friend: (value) => `/api/users/${value}/friends/add/`,
    remove_friend: (value) => `/api/users/${value}/friends/remove/`,
    confirm_friend: (value) => `/api/users/${value}/friends/confirm/`,
    decline_friend: (value) => `/api/users/${value}/friends/decline/`, 

    avatar: () => `/api/images/avatar/`
}

export async function api_get(page, id) {
    return await fetch(api_pages[page](id), {
        headers: { "Authentication": localStorage.getItem("token") }
    })
        .then((response) => { return response.json() })
        .then((data) => { return data })
}

export async function api_send(page, data, method, id=null) {
    return await fetch(api_pages[page](id), {
        method: method,
        headers: {
            "Content-type": "application/json",
            "Authentication": localStorage.getItem("token")
        },
        body: JSON.stringify(data)
    })
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}

export async function api_file(page, data) {
    return await fetch(api_pages[page](), {
        method: "POST",
        headers: { "Authentication": localStorage.getItem("token") },
        body: data
    })
        .then(async (response) => { return await response.json() })
        .then((data) => { return data })
}