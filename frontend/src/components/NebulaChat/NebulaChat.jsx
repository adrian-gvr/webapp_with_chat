import React, { useEffect, useState } from "react";
import { socket } from "./socket";
import "./chat.css";

export default function NebulaChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("connect");
      socket.off("chat message");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit("set username", username || "Anonimo");
    socket.emit("chat message", input);

    setInput("");
  };

  return (
    <div className="chat-container">
      <aside className="sidebar">
        <h2>Nebula Chat</h2>

        <label>Il tuo nome</label>
        <input
          type="text"
          placeholder="Es. Adrian"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </aside>

      <main className="chat">
        <div className="messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.id === myId ? "me" : "other"}`}
            >
              <div className="message-header">
                <span className="message-username">
                  {msg.id === myId ? `${msg.user} (tu)` : msg.user}
                </span>

                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <p className="message-text">{msg.text}</p>
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Scrivi un messaggio..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Invia</button>
        </form>
      </main>
    </div>
  );
}
