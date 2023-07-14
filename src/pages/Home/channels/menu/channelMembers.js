import { useState, useMemo } from "react"
import { createPortal } from "react-dom"

import { useActive, useUser } from "../../../../context"
import { UserCard } from "../../../../components"
import { OptionsMenu } from "../"

export function ChannelMembers({ props }) {
    const { close } = props

    const [user,] = useUser()
    const [active,] = useActive()
    const channel = active.channel

    const [menu, setMenu] = useState({ id: null, element: null, type: null, x: 0, y: 0 })
    const [query, setQuery] = useState("")

    const sortedMembers = useMemo(() => {
        if (!channel.users || !Object.keys(channel.users).length) return []
        return Object.values(channel.users).sort((a, b) => {
            if ((a.nick || a.display_name || a.name) < (b.nick || b.display_name || b.name)) return -1
            if ((a.nick || a.display_name || a.name) > (b.nick || b.display_name || b.name)) return 1
            return 0
        })
    }, [Object.values(channel.users)])

    const filteredItems = useMemo(() => {
        if (!sortedMembers.length) return []

        return sortedMembers.filter(member => {
            return member.name.toLowerCase().includes(query.toLowerCase())
        })
    }, [sortedMembers, query])

    return (
        <div className="settings-edit-card center-column-container">
            <div className="column-container">
                <h2>Channel Members</h2>
                <button className="card-close center-container" onClick={() => close()}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <div className="column-container">
                <p className="category-text">SEARCH</p>
                <div className="friend-search-wrapper small-search spaced-container">
                    <input className="friend-search-input" onChange={(e) => { setQuery(e.target.value) }} />
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                </div>
                {filteredItems && filteredItems.length
                    ? <div className="friends-wrapper column-container scroller-container">
                        {filteredItems.map(member => {
                            if (member.id === user.id) member = {...member, ...user}

                            return (
                                <div className="small-card friend-card user-card center-container spaced-container" key={`filtered-${member.id}`}>
                                    <div className="center-container">
                                        <button onClick={(e) => setMenu({ id: member.id, element: e.target, type: "userCard", x: e.target.getBoundingClientRect().right, y: e.target.getBoundingClientRect().top })}>
                                            <img className="friend-icon skeleton" src={`/api/images/${member.avatar}.webp`} onLoad={(e) => e.target.classList.remove("skeleton")} />
                                        </button>
                                        <div className="column-container">
                                            {(member.display_name || member.nick)
                                                ? <div className="member-name-wrapper">
                                                    {member.nick ? member.nick : member.display_name}
                                                    {(!channel.direct && (member.id === channel.owner || member.admin)) ? <p className="text-note">{member.id === channel.owner ? "OWNER" : "ADMIN"}</p> : null}
                                                </div>
                                                : <div className="member-name-wrapper">
                                                    {member.name}
                                                    {(!channel.direct && (member.id === channel.owner || member.admin)) ? <p className="text-note">{member.id === channel.owner ? "OWNER" : "ADMIN"}</p> : null}
                                                </div>
                                            }
                                            <p className="text-note">{(member.display_name || member.nick) ? member.name : ""}</p>
                                        </div>
                                    </div>
                                    {(menu.id === member.id && menu.type === "userCard") &&
                                        createPortal(<UserCard element={menu.element} member={member} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />, document.getElementsByClassName("layer")[0])
                                    }
                                    {((channel.owner !== member.id && member.id !== user.id) && (channel.owner === user.id || channel.admin)) ?
                                        <>
                                            <button className="member-options-btn center-container" onClick={(e) => setMenu({ id: member.id, element: e.target, type: "options", x: e.target.getBoundingClientRect().left, y: e.target.getBoundingClientRect().top })}>
                                                <svg width="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                                </svg>
                                            </button>
                                            {(menu.id === member.id && menu.type === "options") &&
                                                createPortal(<OptionsMenu element={menu.element} member={member} channel={channel} x={menu.x} y={menu.y} close={() => setMenu({ id: null, element: null, type: null, x: 0, y: 0 })} setCard={close} />, document.getElementsByClassName("layer")[0])
                                            }
                                        </> : null
                                    }
                                </div>
                            )
                        })}
                        <div className="scroller-spacer"></div>
                    </div>
                    : <div className="category-text center-container">NO MATCHING FRIENDS</div>
                }
            </div>
        </div>
    )
}