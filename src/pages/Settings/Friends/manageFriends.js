import { apiSend } from "../../../utils"

export function removeFriend(button, friend_id, setFriends, setFlash) {
    if (!friend_id) return

    apiSend(button, "removeFriend", { friend: friend_id }, "DELETE", "@me").then(res => {
        if (res.errors) return setFlash(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")

        if (res.message === "200 OK") {
            setFriends(current_friends => {
                if (!current_friends.accepted) return current_friends
                return { ...current_friends, accepted: current_friends.accepted.filter(filter_friend => filter_friend.id != friend_id) }
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
                if (current_friends.accepted && current_friends.accepted.some(({ id }) => id === friend.id)) {
                    return {
                        pending: current_friends.pending ? current_friends.pending.filter(filter_friend => filter_friend.id != friend.id) : [],
                        accepted: current_friends.accepted ? current_friends.accepted : []
                    }
                }

                return {
                    pending: current_friends.pending ? current_friends.pending.filter(filter_friend => filter_friend.id != friend.id) : [],
                    accepted: current_friends.accepted ? [friend, ...current_friends.accepted] : [friend]
                }
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
                if (!current_friends.pending) return current_friends
                return { ...current_friends, pending: current_friends.pending.filter(filter_friend => filter_friend.id != friend_id) }
            })
            return setFlash("Friend request declined")
        }

        if (res.message) return setFlash(res.message, "error")
        setFlash("Something went wrong!", "error")
    })
}