import { useEffect } from "react";

import { useUser } from "../context"
import { Loading } from ".";

import { DisplayName, Username, Email, DeleteAccount } from "../pages/Settings/Account";
import { Password, MFASetup } from "../pages/Settings/Security";
import { ChannelCreator, ChannelSettings, ChannelMembers, ChannelInvite, ChannelLeave } from "../pages/Home/channels";

// Card content (edit card)
export function Card(props) {
    const { card, close } = props
    const [user, _] = useUser()

    // Add event listeners
    useEffect(() => {
        let card_overlay = document.getElementById("edit-card-overlay")
        const close_card = () => close()

        card_overlay.addEventListener("click", close_card)
        return () => { card_overlay.removeEventListener("click", close_card) }
    }, [])

    if (!user) return (<Loading />)

    // Account Page
    if (card === "display_name") return (<DisplayName props={props} />)
    if (card === "username") return (<Username props={props} />)
    if (card === "email") return (<Email props={props} />)
    if (card === "delete_account") return (<DeleteAccount props={props} />)

    // Security Page
    if (card === "password") return (<Password props={props} />)
    if (card === "mfa") return (<MFASetup props={props} />)

    // Channels managing
    if (card === "channel_creator") return (<ChannelCreator props={props} />)
    if (card === "channelSettings") return (<ChannelSettings props={props} />)
    if (card === "channel_members") return (<ChannelMembers props={props} />)
    if (card === "channel_invite") return (<ChannelInvite props={props} />)
    if (card === "channelLeave") return (<ChannelLeave props={props} />)
} 