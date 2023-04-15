import Account from "./Account/"
import Security from "./Security/"
import Friends from "./Friends"
import Appearance from "./Appearance/"
import Advanced from "./Advanced/"

import { Loading } from "../../components/"

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