import { api_send, flash_message } from "../../../utils"

export function add_friend(friend) {
    if (!friend) return

    api_send("add_friend", { friend: friend }, "POST", "@me").then(res => {
        if (res.errors) return flash_message(res.error.friend ? res.error.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") { 
            return console.log(res) 
        }

        flash_message("Something went wrong!", "error")
    })
}

export function remove_friend(friend) {
    if (!friend) return

    api_send("remove_friend", { friend: friend }, "DELETE", "@me").then(res => {
        if (res.errors) return flash_message(res.error.friend ? res.error.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") { 
            return console.log(res) 
        }

        flash_message("Something went wrong!", "error")
    })
}

export function confirm_friend(friend) {
    if (!friend) return

    api_send("confirm_friend", { friend: friend }, "PATCH", "@me").then(res => {
        if (res.errors) return flash_message(res.error.friend ? res.error.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") { 
            return console.log(res) 
        }

        flash_message("Something went wrong!", "error")
    })
}

export function decline_friend(friend) {
    if (!friend) return

    api_send("decline_friend", { friend: friend }, "DELETE", "@me").then(res => {
        if (res.errors) return flash_message(res.error.friend ? res.error.friend : "Something went wrong!", "error")
        if (res.message === "200 OK") { 
            return console.log(res) 
        }

        flash_message("Something went wrong!", "error")
    })
}