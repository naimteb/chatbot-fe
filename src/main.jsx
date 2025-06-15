import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      {/**here we wraped app within the authprovider so now app can acces  the auth, login and logout  */}
      <App />
    </AuthProvider>
  </StrictMode>
);
