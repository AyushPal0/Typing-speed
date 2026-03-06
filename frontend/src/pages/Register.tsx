import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { getToken } from "../services/api";
import "../App.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (getToken()) navigate("/");
    }, [navigate]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") register();
    };

    const register = async () => {
        setError("");
        setSuccess("");

        if (!username || !email || !password || !confirm) {
            setError("Please fill in all fields.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);
            await registerUser(username, email, password);
            setSuccess("Account created! Redirecting to login…");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err: any) {
            const detail = err?.response?.data?.detail;
            setError(detail || "Registration failed. Username or email may already be taken.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card" onKeyDown={handleKeyDown}>
                <h2 className="login-title">⚡ Create Account</h2>
                <p className="login-subtitle">Join TypeMaster and track your speed</p>

                {error && <p className="login-error">{error}</p>}
                {success && <p className="login-success">{success}</p>}

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
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    className="login-input"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />

                <button
                    className="login-button"
                    onClick={register}
                    disabled={loading}
                >
                    {loading ? "Creating account…" : "Register"}
                </button>

                <p className="login-footer-text">
                    Already have an account?{" "}
                    <Link to="/login" className="login-link">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
