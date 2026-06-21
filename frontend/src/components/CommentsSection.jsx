import React, { useState, useEffect } from "react";
import axios from "axios";

function CommentsSection({ postId, isAdmin }) {
  const [comments, setComments] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [form, setForm] = useState({
    author_name: "",
    author_email: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Carica commenti approvati
  useEffect(() => {
    axios
      .get(`/api/posts/${postId}/comments`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error(err));
  }, [postId]);

  // Se admin, carica commenti in attesa
  useEffect(() => {
    if (isAdmin) {
      axios
        .get("/api/admin/comments/pending")
        .then((res) => setPendingComments(res.data))
        .catch((err) => console.error(err));
    }
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.content.trim()) {
      setMessage({ type: "error", text: "Nome e commento sono obbligatori" });
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/api/posts/${postId}/comments`, form);
      setMessage({
        type: "success",
        text: "Commento inviato! In attesa di approvazione.",
      });
      setForm({ author_name: "", author_email: "", content: "" });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({ type: "error", text: "Errore durante l'invio" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    await axios.put(`/api/admin/comments/${id}/approve`);
    setPendingComments(pendingComments.filter((c) => c.id !== id));
    const res = await axios.get(`/api/posts/${postId}/comments`);
    setComments(res.data);
  };

  const handleDelete = async (id, isPending = false) => {
    if (confirm("Eliminare questo commento?")) {
      await axios.delete(`/api/admin/comments/${id}`);
      if (isPending) {
        setPendingComments(pendingComments.filter((c) => c.id !== id));
      } else {
        setComments(comments.filter((c) => c.id !== id));
      }
    }
  };

  return (
    <div
      style={{
        marginTop: "40px",
        borderTop: "2px solid #e5e7eb",
        paddingTop: "32px",
      }}
    >
      <h3
        style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "24px" }}
      >
        💬 Commenti ({comments.length})
      </h3>

      {message && (
        <div
          style={{
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "16px",
            backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Lista commenti approvati */}
      <div style={{ marginBottom: "32px" }}>
        {comments.length === 0 && (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "20px" }}>
            Nessun commento. Sii il primo a commentare!
          </p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <strong>{comment.author_name}</strong>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                {new Date(comment.created_at).toLocaleDateString("it-IT")}
              </span>
            </div>
            <p style={{ margin: "0", color: "#4b5563", fontSize: "14px" }}>
              {comment.content}
            </p>
            {isAdmin && (
              <button
                onClick={() => handleDelete(comment.id, false)}
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#ef4444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Elimina
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Commenti in attesa (solo admin) */}
      {isAdmin &&
        pendingComments.filter((c) => c.post_id === postId).length > 0 && (
          <div
            style={{
              marginBottom: "32px",
              backgroundColor: "#fef3c7",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "12px",
                color: "#d97706",
              }}
            >
              ⏳ Commenti in attesa (
              {pendingComments.filter((c) => c.post_id === postId).length})
            </h4>
            {pendingComments
              .filter((c) => c.post_id === postId)
              .map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    backgroundColor: "#fffbeb",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <strong>{comment.author_name}</strong>{" "}
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                      ({comment.author_email || "senza email"})
                    </span>
                  </div>
                  <p style={{ margin: "8px 0", fontSize: "14px" }}>
                    {comment.content}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleApprove(comment.id)}
                      style={{
                        padding: "4px 12px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ✅ Approva
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id, true)}
                      style={{
                        padding: "4px 12px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ❌ Rifiuta
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

      {/* FORM PER COMMENTO */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h4
          style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px" }}
        >
          Lascia un commento
        </h4>
        <input
          type="text"
          placeholder="Il tuo nome *"
          value={form.author_name}
          onChange={(e) => setForm({ ...form, author_name: e.target.value })}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
          required
        />
        <input
          type="email"
          placeholder="La tua email (opzionale)"
          value={form.author_email}
          onChange={(e) => setForm({ ...form, author_email: e.target.value })}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        />
        <textarea
          placeholder="Il tuo commento *"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows="3"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
          required
        ></textarea>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 20px",
            backgroundColor: "#9333ea",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Invio in corso..." : "Invia commento"}
        </button>
        <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "12px" }}>
          Il tuo commento verrà visualizzato dopo l'approvazione.
        </p>
      </form>
    </div>
  );
}

export default CommentsSection;
