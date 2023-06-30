import { apiSend } from "../../../utils"

export function removeFriend(button, friend_id, setFriends, setFlash) {
    if (!friend_id) return

    apiSend(button, "removeFriend", { friend: friend_id }, "DELETE", "@me").then(res => {
        if (res.errors) return setFlash(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")

        if (res.message === "200 OK") {
            setFriends(current_friends => {
                if (!current_friends.accepted || !Object.keys(current_friends.accepted)) return current_friends

                delete current_friends.accepted[friend_id]
                return current_friends
            })
            return setFlash("Friend removed")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function confirmFriend(button, friend, setFriends, setFlash) {
    if (!friend) return

    apiSend(button, "confirmFriend", { friend: friend.id }, "PATCH", "@me").then(res => {
        if (res.errors) return setFlash(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")

        if (res.message === "200 OK" && res.time) {
            friend.accepted = res.time
            setFriends(current_friends => {
                if (current_friends.pending && current_friends.pending[friend.id]) delete current_friends.pending[friend.id]
                current_friends.accepted[friend.id] = friend

                return current_friends
            })
            return setFlash("Friend request confirmed!")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}

export function declineFriend(button, friend_id, setFriends, setFlash) {
    if (!friend_id) return

    apiSend(button, "declineFriend", { friend: friend_id }, "DELETE", "@me").then(res => {
        if (res.errors) return setFlash(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")

        if (res.message === "200 OK") {
            setFriends(current_friends => {
                if (current_friends.pending && current_friends.pending[friend_id]) delete current_friends.pending[friend_id]
                return current_friends
            })
            return setFlash("Friend request declined")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}