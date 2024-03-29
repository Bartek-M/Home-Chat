import { useState } from "react"

import { Channel } from "./channel"
import { Direct } from "./direct"

export function ChannelCreator({ props }) {
    const { close } = props
    const [page, setPage] = useState("direct")

    return (
        <div className="settings-edit-card center-column-container">
            <div className="column-container">
                <h2>Channel Creator</h2>
                <button className="card-close center-container" onClick={() => close()}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <div className="creator-tabs-wrapper center-container">
                <button className={`switch-btn ${page === "direct" ? "active" : ""}`} onClick={() => setPage("direct")}>DIRECT</button>
                <button className={`switch-btn ${page === "group" ? "active" : ""}`} onClick={() => setPage("group")}>GROUP</button>
            </div>
            <div className="channel-creator center-container">
                {page === "group"
                    ? <Channel close={close} />
                    : <Direct close={close} />
                }
            </div>
        </div>
    )
}