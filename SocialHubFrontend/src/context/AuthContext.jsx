import React, { createContext, useContext, useState, useEffect } from "react";
import Keycloak from "keycloak-js";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const keycloakInstance = new Keycloak({
      url: "http://localhost:8180", // Ensure this matches your Keycloak server URL
      realm: "socialhub", // Ensure this matches your Keycloak realm
      clientId: "keycloak-react-client", // Ensure this matches your Keycloak client ID
    });

    let refreshInterval; // Declare the interval variable outside

    keycloakInstance
      .init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`, // Ensure this file exists in the public folder
        pkceMethod: "S256",
        checkLoginIframe: false,
      })
      .then((auth) => {
        setKeycloak(keycloakInstance);
        setAuthenticated(auth);
        setLoading(false);

        if (auth) {
          localStorage.setItem("token", keycloakInstance.token);

          // Attach Authorization header automatically
          api.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${keycloakInstance.token}`;
            return config;
          });

          // 🔵 Sync user with backend
          syncUser(keycloakInstance);

          // 🔁 Refresh token every 5 minutes
          refreshInterval = setInterval(() => {
            keycloakInstance.updateToken(60)
              .then((refreshed) => {
                if (refreshed) {
                  console.log("🆕 Token refreshed");
                  localStorage.setItem("token", keycloakInstance.token);
                } else {
                  console.log("🔁 Token is still valid");
                }
              })
              .catch(() => {
                console.warn("⚠️ Token refresh failed. Logging out.");
                keycloakInstance.logout({ redirectUri: window.location.origin });
              });
          }, 300000); // 5 minutes
        }
      })
      .catch((err) => {
        console.error("Keycloak init error:", err);
        setLoading(false);
      });

    // 🧼 Cleanup function to clear the interval
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        console.log("🧼 Cleared refresh interval");
      }
    };
  }, []);

  // 🔵 New function to sync user
  const syncUser = async (keycloakInstance) => {
    try {
      const userData = {
        username: keycloakInstance.tokenParsed.preferred_username,
        email: keycloakInstance.tokenParsed.email,
        password: "socialhub-keycloak", // Dummy password
        keycloakId: keycloakInstance.tokenParsed.sub,
      };

      const response = await api.post("/users/sync", userData);
      console.log("✅ User synced successfully:", response.data);
    } catch (error) {
      console.error("❌ Failed to sync user:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };

  const login = () => {
    if (keycloak) {
      keycloak.login({ redirectUri: window.location.origin });
    } else {
      console.warn("⚠️ Keycloak is not initialized yet.");
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({ redirectUri: window.location.origin });
      localStorage.removeItem("token");
      setAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ keycloak, authenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);