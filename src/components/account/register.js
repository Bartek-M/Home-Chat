import React from "react";

export default function Register() {
    return (
        <div className="login-page center-container">
            <div className="login-window">
                <h1 className="login-title">Create an account</h1>

                <div className="column-container">
                    <p className="category-text">EMAIL</p>
                    <input className="input-field" type="email" name="email" size="30" required />
                </div>
                <div className="column-container">
                    <p className="category-text">USERNAME</p>
                    <input className="input-field" name="usrname" size="30" required />
                </div>
                <div className="column-container">
                    <p className="category-text">PASSWORD</p>
                    <input className="input-field" type="password" name="passwd" size="30" required />
                </div>

                <input className="login-submit submit-btn" type="submit" value="CONTINUE" />
                <p className="login-redirect">Already have an account? <a className="link" href="login">Log In</a></p>
            </div>
        </div>
    )
}