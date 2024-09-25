import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import "./Forms.css";

function SignIn() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [resultMessage, setResultMessage] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        setResultMessage("Sign In coming soon!");
    }

    return (
        <div className="SignIn">
            <h1 className="account-form-title">Sign In</h1>
            <p className="result-message">{resultMessage}</p>
            <form className="account-form" onSubmit={handleSubmit}>
                <label className="account-label">
                    Username
                    <br/>
                    <input
                        className="account-input" 
                        type="text"
                        placeholder="Username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.trim())}
                    />
                </label>
                <br />
                <label className="account-label">
                    Password
                    <br/>
                    <input 
                        className="account-input" 
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value.trim())}
                    />
                </label>
                <button className="account-submit-button" type="submit">Sign In</button>
            </form>
            <p className="account-form-link">Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
    );
}

export default SignIn;