import React from "react";
import { Link } from "react-router-dom";

function Privacy() {
  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "8px",
          color: "#1f2937",
        }}
      >
        Privacy Policy
      </h1>
      <p
        style={{
          color: "#6b7280",
          marginBottom: "32px",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "16px",
        }}
      >
        Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <section>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#9333ea",
            }}
          >
            1. Introduzione
          </h2>
          <p style={{ lineHeight: "1.6", color: "#4b5563" }}>
            Benvenuto nel mio sito portfolio. La tua privacy è importante per
            me. Questa informativa spiega quali dati raccolgo, come li utilizzo
            e quali sono i tuoi diritti in conformità con il{" "}
            <strong>
              Regolamento Generale sulla Protezione dei Dati (GDPR) 2026
            </strong>
            .
          </p>
        </section>

        <section>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#9333ea",
            }}
          >
            2. Dati che raccolgo
          </h2>
          <ul
            style={{ lineHeight: "1.6", color: "#4b5563", paddingLeft: "20px" }}
          >
            <li>
              <strong>Cookie tecnici:</strong> Necessari per il funzionamento
              del sito
            </li>
            <li>
              <strong>Dati di navigazione:</strong> Indirizzo IP (anonimizzato),
              tipo di browser, pagine visitate
            </li>
            <li>
              <strong>Dati del form contatti:</strong> Nome, email, messaggio
              (solo se mi scrivi)
            </li>
            <li>
              <strong>Account admin:</strong> Username e password criptata (solo
              per me)
            </li>
          </ul>
        </section>

        <section>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#9333ea",
            }}
          >
            3. Come utilizzo i tuoi dati
          </h2>
          <ul
            style={{ lineHeight: "1.6", color: "#4b5563", paddingLeft: "20px" }}
          >
            <li>✅ Per far funzionare correttamente il sito</li>
            <li>✅ Per rispondere ai tuoi messaggi</li>
            <li>✅ Per migliorare l'esperienza di navigazione</li>
            <li>❌ Mai per vendita a terzi</li>
            <li>❌ Mai per marketing senza consenso</li>
          </ul>
        </section>

        <section>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#9333ea",
            }}
          >
            4. I tuoi diritti (GDPR 2026)
          </h2>
          <p
            style={{
              lineHeight: "1.6",
              color: "#4b5563",
              marginBottom: "12px",
            }}
          >
            Hai il diritto di:
          </p>
          <ul
            style={{ lineHeight: "1.6", color: "#4b5563", paddingLeft: "20px" }}
          >
            <li>
              📋 <strong>Accesso:</strong> Sapere quali dati ho su di te
            </li>
            <li>
              📥 <strong>Portabilità:</strong> Ricevere i tuoi dati in formato
              digitale
            </li>
            <li>
              🗑️ <strong>Cancellazione:</strong> Richiedere la cancellazione dei
              tuoi dati
            </li>
            <li>
              ✏️ <strong>Rettifica:</strong> Correggere dati errati
            </li>
            <li>
              🚫 <strong>Opposizione:</strong> Opporti al trattamento dei dati
            </li>
          </ul>
        </section>

        <section>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#9333ea",
            }}
          >
            5. Cookie
          </h2>
          <p style={{ lineHeight: "1.6", color: "#4b5563" }}>
            Questo sito utilizza solo <strong>cookie tecnici</strong>{" "}
            (essenziali per il funzionamento). Non utilizzo cookie di
            profilazione, marketing o tracciamento di terze parti.
          </p>
        </section>

        <section>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#9333ea",
            }}
          >
            6. Conservazione dei dati
          </h2>
          <p style={{ lineHeight: "1.6", color: "#4b5563" }}>
            I dati del form contatti vengono conservati per massimo{" "}
            <strong>12 mesi</strong>. Puoi richiedere la cancellazione in
            qualsiasi momento.
          </p>
        </section>

        <section>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#9333ea",
            }}
          >
            7. Contatti per il GDPR
          </h2>
          <p style={{ lineHeight: "1.6", color: "#4b5563" }}>
            Per esercitare i tuoi diritti o per qualsiasi domanda sulla privacy,
            scrivimi a:
            <br />
            <strong style={{ color: "#9333ea" }}>privacy@miosito.it</strong>
          </p>
        </section>

        <section>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#9333ea",
            }}
          >
            8. Modifiche alla policy
          </h2>
          <p style={{ lineHeight: "1.6", color: "#4b5563" }}>
            Questa policy può essere aggiornata periodicamente. La data
            dell'ultimo aggiornamento è sempre in cima alla pagina.
          </p>
        </section>
      </div>

      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <Link to="/" style={{ color: "#9333ea", textDecoration: "none" }}>
          ← Torna alla Home
        </Link>
      </div>
    </div>
  );
}

export default Privacy;
