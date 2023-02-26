export default function Security() {
    return (
        <>
            <h2 className="settings-title">Security</h2>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">PASSWORD</p>
                    <p>It's good to have a strong password everywhere</p>
                </div>
                <button className="settings-btn stng-edit-btn" id="settings-edit-password">Edit</button>
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">TWO FACTOR AUTHENTICATION</p>
                    <p>Good way to add an extra layer of security for your account</p>
                </div>
                <button className="settings-btn stng-edit-btn" id="settings-edit-2fa">Edit</button>
            </div>
            <hr className="separator"/>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">ACCOUNT VISIBILITY</p>
                    <p>Change your account visibility</p>
                </div>
                <button className="settings-btn stng-edit-btn" id="settings-edit-to-do">Edit</button>
            </div>
            <div className="spaced-container">
                <div className="column-container">
                    <p className="category-text">TOKEN REGENRATE</p>
                    <p>Token is the most secret thing<br/>For safety reasons, you can regenerate it</p>
                </div>
                <button className="settings-btn stng-warning-btn" id="settings-edit-regenerate-token">Regenerate</button>
            </div>
        </>
    )
}