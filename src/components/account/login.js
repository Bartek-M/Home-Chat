export default function Login() {
    return (
        <div className="login-page center-container">
            <div className="login-window">
                <h1 className="login-title">Welcome back!</h1>

                <div className="column-container">
                    <p className="category-text">EMAIL</p>
                    <input className="input-field" name="email" maxLength={100} required />
                </div>
                <div className="column-container">
                    <p className="category-text">PASSWORD</p>
                    <input className="input-field" type="password" name="passwd" maxLength={50} required />
                </div>
                <p className="login-redirect"><a className="link" href="password-recovery">Forgot your password?</a></p>

                <input className="login-submit submit-btn" type="submit" value="LOG IN" />
                <p className="login-redirect">Need an account? <a className="link" href="register">Register</a></p>
            </div>
        </div>
    )
}