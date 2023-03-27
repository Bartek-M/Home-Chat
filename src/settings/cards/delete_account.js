export default function DeleteAccount({ props }) {
    const { close } = props

    return (
        <>
            <div className="column-container">
                <h3>Enter Your Password</h3>
            </div>
            <div className="column-container">
                <p className="category-text">PASSWORD <span className="error-category-text" id="password-error">*</span></p>
                <input className="input-field" type="password" maxLength={50} required />
            </div>
            <div className="card-submit-wrapper">
                <button className="card-cancel-btn" onClick={close}>Cancel</button>
                <button className="card-submit-btn submit-btn">Next</button>
            </div>
        </>
    )
}