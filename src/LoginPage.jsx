import { useState } from "react";
import axiosInstance from "./api/axiosInstance";
import { useAuth } from "./context/AuthContext";
import "./loginPage.css";

export default function LoginPage() {
  const { login, username, setUsername } = useAuth();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await axiosInstance.post("/login", {
        username,
        password,
      });

      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;

      login(accessToken, refreshToken);
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response && error.response.data?.message) {
        setErrorMessage(error.response.data.message); // backend-provided message
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
