export default function Account(props) {
    const { user, open_card } = props

    return (
        <>
            <h2 className="settings-title">Account</h2>
            <div className="settings-card column-container">
                <div className="user-info center-container">
                    <img className="settings-avatar" src={`/api/photos/${user ? user.avatar : "generic"}.webp`} />
                    <h2>{user ? user.name : "n/a"}<span className="user-tag">#{user ? user.tag : "0000"}</span></h2>
                </div>
                <div className="account-settings column-container">
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">USERNAME</p>
                            <p>{user ? user.name : "n/a"}<span className="user-tag">#{user ? user.tag : "0000"}</span></p>
                        </div>
                        <button className="settings-btn stng-edit-btn" onClick={() => open_card("username")}>Edit</button>
                    </div>
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">EMAIL</p>
                            <p>{user ? user.email : "n/a"}</p>
                        </div>
                        <button className="settings-btn stng-edit-btn" onClick={() => open_card("email")}>Edit</button>
                    </div>
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">PHONE NUMBER</p>
                            <p>{user ? ((user.phone == "not set") ? ("You haven't added a phone number yet.") : (user.phone)) : "n/a"}</p>
                        </div>
                        <button className="settings-btn stng-edit-btn">
                            {user ? ((user.phone == "not set") ? ("Add") : ("Edit")) : "Edit"}
                        </button>
                    </div>
                </div>
            </div>
            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">USER ID</p>
                    <p>{user ? user.id : "n/a"}</p>
                </div>
                <button className="settings-btn stng-action-btn">Copy</button>
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">ACCOUNT REMOVAL</p>
                    <p>Delete your account (This action can not be reverted!)</p>
                </div>
                <button className="settings-btn stng-warning-btn">Delete Account</button>
            </div>
        </>
    )
}