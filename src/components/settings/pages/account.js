import React from "react";

export default function Account() {
    const me = {
        id: "123123091287409",
        name: "Bartek",
        tag: "1234",
        avatar: "123456789"
    }

    const settings = {
        email: "test@test.com",
        phone: "123 456 789"
    }

    return (
        <>
            <h2 className="settings-title">Account</h2>
            <div className="settings-card column-container">
                <div className="user-info center-container">
                    <img className="settings-avatar" src={`/api/photos/${me.avatar}.webp`} />
                    <h2>{me.name}<span className="user-tag">#{me.tag}</span></h2>
                </div>
                <div className="account-settings column-container">
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">USERNAME</p>
                            <p>{me.name}<span className="user-tag">#{me.tag}</span></p>
                        </div>
                        <button className="settings-btn stng-edit-btn" id="settings-edit-username">Edit</button>
                    </div>
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">EMAIL</p>
                            <p>{settings.email}</p>
                        </div>
                        <button className="settings-btn stng-edit-btn" id="settings-edit-email">Edit</button>
                    </div>
                    <div className="spaced-container">
                        <div className="column-container">
                            <p className="category-text">PHONE NUMBER</p>
                            <p>{(settings.phone == "not set") ? ("You haven't added a phone number yet.") : (settings.phone)}</p>
                        </div>
                        <button className="settings-btn stng-edit-btn" id="settings-edit-phone">
                            {(settings.phone == "not set") ? ("Add") : ("Edit")}
                        </button>
                    </div>
                </div>
            </div>
            <hr className="separator" />
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">USER ID</p>
                    <p>{me.id}</p>
                </div>
                <button className="settings-btn stng-action-btn" id="settings-action-copy_id">Copy</button>
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">ACCOUNT REMOVAL</p>
                    <p>Delete your account (This action can not be reverted!)</p>
                </div>
                <button className="settings-btn stng-warning-btn" id="settings-action-delete_account">Delete Account</button>
            </div>
        </>
    )
}