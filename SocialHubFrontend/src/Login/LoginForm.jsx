import React from 'react';
import { useAuth } from '../context/AuthContext'; // Bruk context

const LoginForm = () => {
  const { authenticated, login, logout, loading } = useAuth();

  if (loading) {
    return <p>Laster Keycloak...</p>;
  }

  return (
    <div>
      <p>{authenticated ? "Du er logget inn" : "Du er ikke logget inn"}</p>
      {!authenticated && (
        <button onClick={login} className="button">
          Login with Keycloak
        </button>
      )}
      {authenticated && (
        <button onClick={logout} className="button">
          Logout
        </button>
      )}
    </div>
  );
};

export default LoginForm;
