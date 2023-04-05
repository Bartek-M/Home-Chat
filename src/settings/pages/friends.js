export default function Friends({ props }) {
    const { user } = props

    return (
        <>
            <h2 className="settings-title">Friends</h2>
            <div className="friend-list-wrapper column-container">
                <div className="friend-card spaced-container">
                    <div className="center-container">
                        <img className="channel-icon" src={`/api/images/${user.avatar}.webp`} />
                        <h2>Bartek#1234</h2>
                    </div>
                </div>
                <div className="friend-card spaced-container">
                    <div className="center-container">
                        <img className="channel-icon" src={`/api/images/${user.avatar}.webp`} />
                        <h2>Bartek#1234</h2>
                    </div>
                </div>
                <div className="friend-card spaced-container">
                    <div className="center-container">
                        <img className="channel-icon" src={`/api/images/${user.avatar}.webp`} />
                        <h2>Bartek#1234</h2>
                    </div>
                </div>
            </div>
        </>
    )
}