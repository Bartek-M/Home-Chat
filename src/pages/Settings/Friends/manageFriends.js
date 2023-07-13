import { apiSend } from "../../../utils"

export function confirmFriend(button, friend, setFlash) {
    if (!friend) return
    
    apiSend(button, "confirmFriend", { friend: friend.id }, "PATCH", "@me").then(res => {
        if (res.errors) return setFlash(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") return setFlash("Friend request confirmed!")
        
        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function removeFriend(button, friend_id, setFlash) {
    if (!friend_id) return

    apiSend(button, "removeFriend", { friend: friend_id }, "DELETE", "@me").then(res => {
        if (res.errors) return setFlash(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") return setFlash("Friend removed")

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function declineFriend(button, friend_id, setFlash) {
    if (!friend_id) return

    apiSend(button, "declineFriend", { friend: friend_id }, "DELETE", "@me").then(res => {
        if (res.errors) return setFlash(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") return setFlash("Friend request declined")

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}