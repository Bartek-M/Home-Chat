import { Account } from "./Account/"
import { Security } from "./Security/"
import { Friends } from "./Friends"
import { Appearance } from "./Appearance/"
import { Notifications } from "./Notifications"

import { Loading } from "../../components/"
import { useUser } from "../../context"

// Settings content (page)
export default function Page(props) {
    const { page } = props
    const [user, _] = useUser()

    if (!user) return (<Loading />)

    if (page === "security") return (<Security props={props}/>)
    if (page === "friends") return (<Friends props={props}/>)
    if (page === "appearance") return (<Appearance props={props}/>)
    if (page === "notifications") return (<Notifications props={props}/>)

    return (<Account props={props}/>)
} 