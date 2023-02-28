import Account from "../pages/account";
import Security from "../pages/security";
import Friends from "../pages/friends";
import Appearance from "../pages/appearance";
import Advanced from "../pages/advanced";

import Loading from "../../components/loading";


// Settings content (page)
export default function Content(props) {
    const { page, user } = props

    if (!user) return (<Loading />)

    if (page === "account") return (<Account props={props}/>)
    if (page === "security") return (<Security props={props}/>)
    if (page === "friends") return (<Friends props={props}/>)
    if (page === "appearance") return (<Appearance props={props}/>)
    if (page === "advanced") return (<Advanced props={props}/>)
} 