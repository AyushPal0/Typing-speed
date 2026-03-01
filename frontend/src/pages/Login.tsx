import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const backendURL = "http://127.0.0.1:8000";

    // 🔐 If already logged in, redirect to home
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/");
        }
    }, [navigate]);

    const login = async () => {
        if (!username || !password) {
            setError("Please enter username and password.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await axios.post(`${backendURL}/login`, {
                username,
                password
            });

            const token = res.data.access_token;

            localStorage.setItem("token", token);

            navigate("/"); // Go to typing test

        } catch (err: any) {
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">

            <div className="login-card">
                <h2 className="login-title">⚡ TypeMaster Login</h2>

                {error && <p className="login-error">{error}</p>}

                <input
                    className="login-input"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>

        </div>
    );
}

export default Login;