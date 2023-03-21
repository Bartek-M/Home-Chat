export default function Account({ props }) {
    const { user, card } = props

    return (
        <>
            <h2 className="settings-title">Account</h2>
            <div className="settings-card column-container">
                <div className="user-info center-container">
                    <div className="avatar-wrapper center-container">
                        <img className="settings-avatar" src={`/api/photos/${user.avatar}.webp`} />
                        <button className="center-container absolute-container" id="avatar-file-btn">CHANGE AVATAR</button>
                    </div>
                    <h2>{user.name}<span className="user-tag">#{user.tag}</span></h2>
                </div>
                <div className="account-settings column-container">
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">USERNAME</p>
                            <p>{user.name}<span className="user-tag">#{user.tag}</span></p>
                        </div>
                        <button className="settings-btn stng-edit-btn" onClick={() => card("username")}>Edit</button>
                    </div>
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">EMAIL</p>
                            <p>{user.email}</p>
                        </div>
                        <button className="settings-btn stng-edit-btn" onClick={() => card("email")}>Edit</button>
                    </div>
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">PHONE NUMBER</p>
                            <p>{(user.phone == "not set") ? ("You haven't added a phone number yet.") : (user.phone)}</p>
                        </div>
                        <button className="settings-btn stng-edit-btn" onClick={() => card("phone")}>
                            {(user.phone == "not set") ? ("Add") : ("Edit")}
                        </button>
                    </div>
                </div>
            </div>
            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">USER ID</p>
                    <p>{user.id}</p>
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