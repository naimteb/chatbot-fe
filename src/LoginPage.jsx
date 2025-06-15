import { useState } from "react";
import axiosInstance from "./api/axiosInstance";
import { useAuth } from "./context/AuthContext";
import "./loginPage.css";

export default function LoginPage() {
  const { login } = useAuth(); //get the  login function from AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { auth } = useAuth(); //accessing the token

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/login", {
        username,
        password,
      });
      console.log("token :", res);
      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;
      //  login(accessToken); // Save token in global state + localStorage

      login(accessToken, refreshToken);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>
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
