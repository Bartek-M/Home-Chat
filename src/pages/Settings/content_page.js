import { Account } from "./Account/"
import { Security } from "./Security/"
import { Friends } from "./Friends"
import { Appearance } from "./Appearance/"
import { Advanced } from "./Advanced/"

import { Loading } from "../../components/"
import { useUser, FriendsProvider } from "../../context"

// Settings content (page)
export default function Page(props) {
    const { page } = props
    const [user, _] = useUser()

    if (!user) return (<Loading />)

    if (page === "security") return (<Security props={props}/>)
    if (page === "friends") return (
        <FriendsProvider>
            <Friends props={props}/>
        </FriendsProvider>
    )
    if (page === "appearance") return (<Appearance props={props}/>)
    if (page === "advanced") return (<Advanced props={props}/>)

    return (<Account props={props}/>)
} 