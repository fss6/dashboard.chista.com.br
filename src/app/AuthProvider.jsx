"use client";
import { Auth0Provider } from "@auth0/auth0-react";

export default function AuthProvider({ children }) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      }}
    >
      {children}
    </Auth0Provider>
  );
} 