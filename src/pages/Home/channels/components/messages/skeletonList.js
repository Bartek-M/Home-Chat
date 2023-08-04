export function SkeletonList({ messageDisplay, size, messageLoader }) {
    const messageAmount = size ? size : 50

    return (
        <div className="chat-window-wrapper column-container" ref={messageLoader} style={{ overflow: "hidden" }}>
            {messageDisplay === "standard"
                ? [...Array(messageAmount)].map((_, i) => (
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
                : [...Array(messageAmount * 2)].map((_, i) => (
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