import { useEffect } from "react";

import { useUser } from "../../context"
import { Loading } from "../../components";

import { Email, Username, DeleteAccount } from "./Account/";
import { Password, MFA } from "./Security"; 

// Card content (edit card)
export default function Card(props) {
    const { card, close } = props
    const [user, _] = useUser()

    // Add event listeners
    useEffect(() => {
        let card_overlay = document.getElementById("edit-card-overlay")
        let close_card = () => close()

        card_overlay.addEventListener("click", close_card)
        return () => { card_overlay.removeEventListener("click", close_card) }
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