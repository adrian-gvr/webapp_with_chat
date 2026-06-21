import React, { useState, useEffect } from "react";
import axios from "axios";

function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Controlla se l'utente ha già dato il consenso
    const consent = localStorage.getItem("gdpr-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("gdpr-consent", "true");
    setIsVisible(false);
    // Invia il consenso al server per log
    axios
      .post("/api/gdpr/consent", { consent: true })
      .catch((err) => console.log(err));
  };

  const declineCookies = () => {
    localStorage.setItem("gdpr-consent", "false");
    setIsVisible(false);
    axios
      .post("/api/gdpr/consent", { consent: false })
      .catch((err) => console.log(err));
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1f2937",
        color: "white",
        padding: "16px",
        zIndex: 1000,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "20px", marginRight: "8px" }}>🍪</span>
          <strong>GDPR 2026 - Consenso Cookie</strong>
          <p style={{ margin: "8px 0 0 0", fontSize: "13px", opacity: 0.9 }}>
            Questo sito utilizza cookie tecnici per il corretto funzionamento. I
            tuoi dati non vengono venduti a terzi.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={acceptCookies}
            style={{
              padding: "8px 24px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Accetta tutti
          </button>
          <button
            onClick={declineCookies}
            style={{
              padding: "8px 24px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Rifiuta
          </button>
          <a
            href="/privacy"
            style={{
              padding: "8px 16px",
              color: "#9ca3af",
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
