export default function MFA({ props }) {
    const { close } = props

    return (
        <>
            <div className="center-column-container">
                <h2>MFA</h2>
                <p className="edit-card-info">MFA - NOT WORKING YET</p>
                <button className="card-close center-container" onClick={close}>
                    <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                        <path d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                    </svg>
                </button>
            </div>
            <div className="column-container">
                <p className="category-text">CURRENT PASSWORD</p>
                <input className="input-field" type="password" name="passwd" maxLength={50} required />
            </div>
            <button className="edit-submit-btn submit-btn">Done</button>
        </>
    )
}