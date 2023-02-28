import Username from "../cards/username";
import Email from "../cards/email";
import Phone from "../cards/phone";
import Password from "../cards/password";

import Loading from "../../components/loading";


// Card content (edit card)
export default function CardContent(props) {
    const { card, user } = props

    if (!user) return (<Loading />)

    if (card === "username") return (<Username props={props} />)
    if (card === "email") return (<Email props={props} />)
    if (card === "phone") return (<Phone props={props} />)
    if (card === "password") return (<Password props={props} />)
} 