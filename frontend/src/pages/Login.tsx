import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, saveToken, getToken } from "../services/api";
import "../App.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (getToken()) navigate("/");
    }, [navigate]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") login();
    };

    const login = async () => {
        if (!username || !password) {
            setError("Please enter username and password.");
            return;
        }
        try {
            setLoading(true);
            setError("");
            const data = await loginUser(username, password);
            if (data?.access_token) {
                saveToken(data.access_token);
                navigate("/");
            } else {
                setError("Invalid credentials.");
            }
        } catch (err: any) {
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card" onKeyDown={handleKeyDown}>
                <h2 className="login-title">⚡ TypeMaster</h2>
                <p className="login-subtitle">Login to track your progress</p>

                {error && <p className="login-error">{error}</p>}

                <input
                    className="login-input"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                />
                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="login-button"
                    onClick={login}
                    disabled={loading}
                >
                    {loading ? "Logging in…" : "Login"}
                </button>

                <p className="login-footer-text">
                    Don't have an account?{" "}
                    <Link to="/register" className="login-link">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;