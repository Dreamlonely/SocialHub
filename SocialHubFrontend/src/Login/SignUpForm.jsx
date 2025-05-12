import React from "react";
import { useAuth } from "../context/AuthContext"; // Bruk context

const SignupForm = () => {
  const { keycloak, loading } = useAuth();

  const handleSignup = (e) => {
    e.preventDefault();
    if (keycloak) {
      keycloak.register(); // Dette sender brukeren til Keycloaks registreringsside
    }
  };

  if (loading) return <p>Laster Keycloak...</p>;

  return (
    <div className="p-4 max-w-sm mx-auto border rounded">
      <h2 className="text-2xl font-bold mb-4">Registrer deg</h2>
      <form onSubmit={handleSignup}>
        <p className="mb-4">Du vil bli videresendt til Keycloaks registreringsside.</p>
        <button type="submit" className="button">
          Gå til registrering
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
