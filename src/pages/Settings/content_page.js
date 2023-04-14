import Account from "../account";
import Security from "../security";
import Friends from "../friends";
import Appearance from "../appearance";
import Advanced from "../advanced";

import Loading from "../../components/loading";


// Settings content (page)
export default function Page(props) {
    const { page, user } = props

    if (!user) return (<Loading />)

    if (page === "security") return (<Security props={props}/>)
    if (page === "friends") return (<Friends props={props}/>)
    if (page === "appearance") return (<Appearance props={props}/>)
    if (page === "advanced") return (<Advanced props={props}/>)

    return (<Account props={props}/>)
} 