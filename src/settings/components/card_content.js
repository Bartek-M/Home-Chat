import Username from "../cards/username";
import Email from "../cards/email";
import DeleteAccount from "../cards/delete_account";

import Password from "../cards/password";
import MFA from "../cards/mfa";

import Loading from "../../components/loading";


// Card content (edit card)
export default function CardContent(props) {
    const { card, user } = props

    if (!user) return (<Loading />)

    // Account Page
    if (card === "username") return (<Username props={props} />)
    if (card === "email") return (<Email props={props} />)
    if (card === "delete_account") return (<DeleteAccount props={props} />)

    // Security Page
    if (card === "password") return (<Password props={props} />)
    if (card === "mfa") return (<MFA props={props} />)
} 