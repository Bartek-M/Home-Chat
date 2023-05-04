import { api_send, flash_message } from "../../../utils"

export function add_friend(user_id, friend, setFriends) {
    if (!friend) return

    api_send("add_friend", { friend: friend.id }, "POST", "@me").then(res => {
        if (res.errors) return flash_message(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") { 
            friend.accepted = "waiting"
            friend.inviting = user_id
            setFriends(current_friends => { 
                if (current_friends.pending) return [friend, ...current_friends]
                return { ...current_friends, pending: friend } 
            })
            return flash_message("Sent a friend request!")
        }

        flash_message("Something went wrong!", "error")
    })
}

export function remove_friend(friend_id, setFriends) {
    if (!friend_id) return

    api_send("remove_friend", { friend: friend_id }, "DELETE", "@me").then(res => {
        if (res.errors) return flash_message(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") { 
            setFriends(current_friends => {
                if (!confirm_friend.accepted) return current_friends
                return { ...current_friends, accepted: current_friends.accepted.filter(filter_friend => filter_friend.id != friend_id) }
            })
            return flash_message("Removed a friend!")
        }

        flash_message("Something went wrong!", "error")
    })
}

export function confirm_friend(friend, setFriends) {
    if (!friend) return

    api_send("confirm_friend", { friend: friend.id }, "PATCH", "@me").then(res => {
        if (res.errors) return flash_message(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")
        if (res.message === "200 OK" && res.time) {
            friend.accepted = res.time
            setFriends(current_friends => {                 
                return { 
                    pending: current_friends.pending ? current_friends.pending.filter(filter_friend => filter_friend.id != friend.id) : [], 
                    accepted: current_friends.accepted ? [friend, ...current_friends.accepted] : [friend] 
                } 
            })
            return flash_message("Confirmed friend request!")
        }

        flash_message("Something went wrong!", "error")
    })
}

export function decline_friend(friend_id, setFriends) {
    if (!friend_id) return

    api_send("decline_friend", { friend: friend_id }, "DELETE", "@me").then(res => {
        if (res.errors) return flash_message(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") { 
            setFriends(current_friends => {
                if (!current_friends.pending) return current_friends
                return { ...current_friends, pending: current_friends.pending.filter(filter_friend => filter_friend.id != friend_id) }
            })
            return flash_message("Declined friend request!")
        }

        flash_message("Something went wrong!", "error")
    })
}