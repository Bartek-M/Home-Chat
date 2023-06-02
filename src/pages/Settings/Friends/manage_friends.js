import { api_send, flash_message } from "../../../utils"

export function add_friend(user_id, friend, setFriends) {
    if (!friend) return

    api_send("add_friend", { friend: friend.id }, "POST", "@me").then(res => {
        if (res.errors) return flash_message(res.errors.friend ? res.errors.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") {
            friend.accepted = "waiting"
            friend.inviting = user_id
            setFriends(current_friends => {
                if (current_friends.pending && current_friends.pending.some(({ id }) => id === friend.id)) return current_friends
                if (current_friends.pending) return { ...current_friends, pending: [friend, ...current_friends.pending] }

                return { ...current_friends, pending: [ friend ] }
            })
            return flash_message("Friend request sent")
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
                if (!current_friends.accepted) return current_friends
                return { ...current_friends, accepted: current_friends.accepted.filter(filter_friend => filter_friend.id != friend_id) }
            })
            return flash_message("Friend removed")
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
            return flash_message("Friend request confirmed!")
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
            return flash_message("Friend request declined")
        }

        flash_message("Something went wrong!", "error")
    })
}