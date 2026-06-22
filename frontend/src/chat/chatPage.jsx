import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://webapp-with-chat.onrender.com", {
  autoConnect: false,
});

export default function ChatPage() {
  const [username, setUsername] = useState("");
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersOnline, setUsersOnline] = useState([]);

  useEffect(() => {
    socket.connect();

    socket.on("chatMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("usersOnline", (users) => {
      setUsersOnline(users);
    });

    return () => {
      socket.off("chatMessage");
      socket.off("usersOnline");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    try {
      window.resizeTo(
        document.body.scrollWidth + 50,
        document.body.scrollHeight + 50,
      );
    } catch (e) {
      console.log("Impossibile ridimensionare la finestra:", e);
    }
  }, []);

  const handleRegister = () => {
    if (!username.trim()) return;
    socket.emit("registerUser", username.trim());
    setRegistered(true);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const data = {
      user: username,
      text: message.trim(),
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("chatMessage", message.trim());
    setMessage("");
  };

  return (
    <div
      style={{
        // l'opzione per cambiare la dimensione della chat
        // height: "100vh",
        display: "flex",
        background: "#0b1120",
        color: "#e5e7eb",
      }}
    >
      {/* CHAT */}
      <div style={{ flex: 3, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #1f2937" }}>
          Chat globale
        </div>

        <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: 8,
                padding: "8px 12px",
                borderRadius: 8,
                background:
                  m.user === username ? "#1d4ed8" : "rgba(31,41,55,0.8)",
                maxWidth: "70%",
                alignSelf: m.user === username ? "flex-end" : "flex-start",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {/* {m.user} • {m.time} */}
                {m.user} • {new Date(m.timestamp).toLocaleTimeString()}
              </div>
              {m.text}
            </div>
          ))}
        </div>

        <div
          style={{
            padding: 12,
            borderTop: "1px solid #1f2937",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Scrivi un messaggio..."
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#020617",
              border: "1px solid #374151",
              color: "#e5e7eb",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              background: "#22c55e",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Invia
          </button>
        </div>
      </div>

      {/* UTENTI ONLINE */}
      <div style={{ flex: 1, borderLeft: "1px solid #1f2937" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #1f2937" }}>
          Utenti online
        </div>

        {!registered ? (
          <div style={{ padding: 16 }}>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="Inserisci il tuo nome"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                background: "#020617",
                border: "1px solid #374151",
                color: "#e5e7eb",
                marginBottom: 8,
              }}
            />
            <button
              onClick={handleRegister}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                background: "#3b82f6",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Entra in chat
            </button>
          </div>
        ) : (
          <div style={{ padding: 16 }}>Connesso come: {username}</div>
        )}

        <div style={{ padding: 16, overflowY: "auto", height: "50%" }}>
          {usersOnline.map((u, i) => (
            <div
              key={i}
              style={{
                padding: 8,
                marginBottom: 6,
                borderRadius: 8,
                background: "#020617",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                }}
              />
              {u}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
