import { useState, useMemo } from "react"
import { useChannels, useFlash } from "../../../../context"

export function ChannelMembers({ props }) {
    const { close } = props

    const [channels, setChannels] = useChannels()
    const setFlash = useFlash()

    const [query, setQuery] = useState("")

    const channel = useMemo(() => {
        if (!channels) return null
        return channels.find(channel => channel.active)
    }, [channels])

    const filteredItems = useMemo(() => {
        if (!channel || !channel.users) return []

        return channel.users.filter(member => {
            return member.name.toLowerCase().includes(query.toLowerCase())
        })
    }, [channels, query])

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
                        {filteredItems.map(member => (
                            <div className="small-card friend-card user-card center-container spaced-container" key={`filtered-${member.id}`}>
                                <div className="center-container">
                                    <img className="friend-icon" src={`/api/images/${member.avatar}.webp`} />
                                    <div className="column-container">
                                        {(member.display_name || member.nick)
                                            ? <div className="member-name-wrapper">
                                                {member.nick ? member.nick : member.display_name}
                                                {member.id === channel.owner ? <p className="text-note">OWNER</p> : null}
                                                {(member.admin && member.id !== channel.owner) ? <p className="text-note">ADMIN</p> : null}
                                            </div>
                                            : <div className="member-name-wrapper">
                                                {member.name}
                                                {member.id === channel.owner ? <p className="text-note">OWNER</p> : null}
                                                {(member.admin && member.id !== channel.owner) ? <p className="text-note">ADMIN</p> : null}
                                            </div>
                                        }
                                        <p className="text-note">{(member.display_name || member.nick) ? member.name : ""}</p>
                                    </div>
                                </div>
                                <button className="member-options-btn center-container" onClick={(e) => null}>
                                    <svg xwidth="16" height="16" fill="var(--FONT_RV_COLOR)" viewBox="0 0 16 16">
                                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <div className="scroller-spacer"></div>
                    </div>
                    : <div className="category-text center-container">NO MATCHING FRIENDS</div>
                }
            </div>
        </div>
    )
}