// API
const API_PAGES = {
    // Auth
    authLogin: () => `auth/login`,
    authRegister: () => `auth/register`,
    authVerify: () => `auth/verify`,

    // Channel data
    channelUsers: (value) => `channels/${value}/users`,
    channelMessages: (value) => `channels/${value}/messages`,
    channelMessage: (value) => `channels/${value}/message`,

    // Create channels
    channelOpen: () => `channels/open`,
    channelCreate: () => `channels/create`,

    // Channel profile
    channelSettings: (value) => `channels/${value}/settings`,
    channelInvite: (value) => `channels/${value}/invite`,
    channelLeave: (value) => `channels/${value}/leave`,
    channelDelete: (value) => `channels/${value}/delete`,

    // Channel users
    memberNick: (value) => `channels/${value[0]}/users/${value[1]}/nick`,
    memberAdmin: (value) => `channels/${value[0]}/users/${value[1]}/admin`,
    memberKick: (value) => `channels/${value[0]}/users/${value[1]}/kick`,
    transferOwner: (value) => `channels/${value[0]}/users/${value[1]}/owner`,

    // User data
    user: (value) => `users/${value}`,
    userSearch: () => `users/search`,
    userChannels: (value) => `users/${value}/channels`,
    userSettings: (value) => `users/${value}/settings`,

    userMFA: (value) => `users/${value}/settings/mfa`,
    userDelete: (value) => `users/${value}/delete`,

    // Friends
    userFriends: (value) => `users/${value}/friends`,
    addFriend: (value) => `users/${value}/friends/add`,
    removeFriend: (value) => `users/${value}/friends/remove`,
    confirmFriend: (value) => `users/${value}/friends/confirm`,
    declineFriend: (value) => `users/${value}/friends/decline`,

    // Notifications
    notifications: (value) => `users/${value}/notifications`,

    // Avatars + Icons
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

export async function apiDelete(button, page, id) {
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