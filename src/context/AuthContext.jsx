import { createContext, useContext, useState } from "react";

const AuthContext = createContext(); // the global container to store the login info like jwt token

export const useAuth = () => useContext(AuthContext); //authcontext acts like a global container
// A custom hook to easily access the context values in any component.

export function AuthProvider({ children }) {
  // children means it wraps all the component inside of it

  const [auth, setAuth] = useState(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  });

  const login = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setAuth({ accessToken, refreshToken });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {" "}
      {/*global props  */}
      {children}
    </AuthContext.Provider>
  );
}
