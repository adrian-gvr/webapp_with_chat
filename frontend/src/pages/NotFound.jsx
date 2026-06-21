import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontSize: "80px", marginBottom: "20px" }}>🔍</div>
      <h1
        style={{
          fontSize: "48px",
          fontWeight: "bold",
          color: "#9333ea",
          marginBottom: "16px",
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#1f2937",
        }}
      >
        Pagina non trovata
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "32px", lineHeight: "1.6" }}>
        Oops! La pagina che stai cercando non esiste o è stata spostata.
      </p>

      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/"
          style={{
            padding: "12px 24px",
            backgroundColor: "#9333ea",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#7e22ce")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#9333ea")}
        >
          🏠 Torna alla Home
        </Link>
        <Link
          to="/blog"
          style={{
            padding: "12px 24px",
            backgroundColor: "#e5e7eb",
            color: "#374151",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#d1d5db")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#e5e7eb")}
        >
          📝 Vai al Blog
        </Link>
      </div>

      <div style={{ marginTop: "40px", fontSize: "14px", color: "#9ca3af" }}>
        <p>
          Hai bisogno di aiuto?{" "}
          <Link to="/contacts" style={{ color: "#9333ea" }}>
            Contattami
          </Link>
        </p>
      </div>
    </div>
  );
}

export default NotFound;
