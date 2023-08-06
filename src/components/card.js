import { useEffect } from "react";

import { useActive, useUser } from "../context"
import { Loading } from ".";

import { DisplayName, Username, Email, DeleteAccount } from "../pages/Settings/Account";
import { Password, MFASetup } from "../pages/Settings/Security";
import { ChannelCreator } from "../pages/Home/creator"
import { ChannelSettings, ChannelMembers, ChannelInvite, ChannelLeave, MemberNick, MemberKick, TransferOwner, DeleteMessage } from "../pages/Home/channels";

// Card content (edit card)
export function Card(props) {
    const { card, close } = props
    const [user, _] = useUser()
    const [active,] = useActive()

    // Add event listeners
    useEffect(() => {
        const card_overlay = document.getElementById("edit-card-overlay")
        const close_card = () => close()

        card_overlay.addEventListener("click", close_card)
        return () => { card_overlay.removeEventListener("click", close_card); close() }
    }, [])

    if (!user) return (<Loading />)

    // Account Page
    if (card === "displayName") return (<DisplayName props={props} />)
    if (card === "username") return (<Username props={props} />)
    if (card === "email") return (<Email props={props} />)
    if (card === "deleteAccount") return (<DeleteAccount props={props} />)

    // Security Page
    if (card === "password") return (<Password props={props} />)
    if (card === "mfa") return (<MFASetup props={props} />)

    // Channels managing
    if (card === "channelCreator") return (<ChannelCreator props={props} />)
    
    useEffect(() => { if (!active.channel) return close() }, [active.channel])
    if (!active.channel) return null

    if (card === "channelSettings") return (<ChannelSettings props={props} />)
    if (card === "channelMembers") return (<ChannelMembers props={props} />)
    if (card === "channelInvite") return (<ChannelInvite props={props} />)
    if (card === "channelLeave") return (<ChannelLeave props={props} />)

    // Member options
    if (card === "memberNick") return (<MemberNick props={props} />)
    if (card === "memberKick") return (<MemberKick props={props} />)
    if (card === "transferOwner") return (<TransferOwner props={props} />)

    // Message options
    if (card === "deleteMessage") return (<DeleteMessage props={props} />)
} 