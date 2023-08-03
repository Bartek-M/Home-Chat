export function SkeletonList({ messageDisplay }) {
    return (
        <div className="chat-window column-container" style={{ overflow: "hidden" }}>
            {messageDisplay === "standard"
                ? [...Array(50)].map((_, i) => (
                    <li className="message-list-item container" key={i}>
                        <div className="avatar skeleton" />
                        <div className="message-content" style={{ minWidth: "100px", width: "400px" }}>
                            <div className="container" style={{ width: "100px" }}>
                                <div className="skeleton skeleton-text" />
                            </div>
                            <div className="skeleton skeleton-text" />
                        </div>
                    </li>
                ))
                : [...Array(100)].map((_, i) => (
                    <li className="compact-msg container" key={i}>
                        <div className="skeleton skeleton-text" style={{ width: "30px" }} />
                        <div className="skeleton skeleton-text" style={{ width: "60px", margin: "3px 0.5rem 3px 0.25rem" }} />
                        <div className="skeleton skeleton-text" style={{ width: "400px" }} />
                    </li>
                ))
            }
        </div>
    )
}