import { useEffect } from "react";
import Loading from "../../components/loading";

import Username from "../account/cards/username";
import Email from "../account/cards/email";
import DeleteAccount from "../account/cards/delete_account";

import Password from "../security/cards/password";
import MFA from "../security/cards/mfa";

// Card content (edit card)
export default function Card(props) {
    const { card, user, close } = props

    // Add event listeners
    useEffect(() => {
        let card_overlay = document.getElementById("edit-card-overlay")
        
        card_overlay.addEventListener("click", close)
        return () => { card_overlay.removeEventListener("click", close) }
    }, [])

    if (!user) return (<Loading />)

    // Account Page
    if (card === "username") return (<Username props={props} />)
    if (card === "email") return (<Email props={props} />)
    if (card === "delete_account") return (<DeleteAccount props={props} />)

    // Security Page
    if (card === "password") return (<Password props={props} />)
    if (card === "mfa") return (<MFA props={props} />)
} 