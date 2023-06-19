import { useEffect } from "react";

import { useUser } from "../context"
import { Loading } from ".";

import { DisplayName, Username, Email, DeleteAccount } from "../pages/Settings/Account";
import { Password, MFASetup } from "../pages/Settings/Security";
import { ChannelCreator, ChannelSettings, ChannelMembers, ChannelInvite, ChannelLeave, MemberNick, MemberKick, TransferOwner } from "../pages/Home/channels";

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
    if (card === "displayName") return (<DisplayName props={props} />)
    if (card === "username") return (<Username props={props} />)
    if (card === "email") return (<Email props={props} />)
    if (card === "deleteAccount") return (<DeleteAccount props={props} />)

    // Security Page
    if (card === "password") return (<Password props={props} />)
    if (card === "mfa") return (<MFASetup props={props} />)

    // Channels managing
    if (card === "channelCreator") return (<ChannelCreator props={props} />)
    if (card === "channelSettings") return (<ChannelSettings props={props} />)
    if (card === "channelMembers") return (<ChannelMembers props={props} />)
    if (card === "channelInvite") return (<ChannelInvite props={props} />)
    if (card === "channelLeave") return (<ChannelLeave props={props} />)

    // Member options
    if (card === "memberNick") return (<MemberNick props={props} />)
    if (card === "memberKick") return (<MemberKick props={props} />)
    if (card === "transferOwner") return (<TransferOwner props={props} />)
} 