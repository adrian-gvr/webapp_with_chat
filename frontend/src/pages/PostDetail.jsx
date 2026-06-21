import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import CommentsSection from "../components/CommentsSection";

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/posts/${id}`)
      .then((res) => {
        console.log("Post ricevuto:", res.data);
        setPost(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Errore:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>Caricamento...</div>
    );
  }

  if (!post) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Post non trovato</h2>
        <Link to="/blog">← Torna al blog</Link>
      </div>
    );
  }

  // Determina quali media mostrare (priorità a mediaUrls, poi mediaUrl)
  const mediaList =
    post.mediaUrls && post.mediaUrls.length > 0
      ? post.mediaUrls
      : post.mediaUrl
        ? [post.mediaUrl]
        : [];

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      {/* Tipo di post */}
      <div
        style={{
          backgroundColor:
            post.type === "image"
              ? "#3b82f6"
              : post.type === "video"
                ? "#ef4444"
                : "#10b981",
          padding: "12px 24px",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {post.type === "image"
          ? "📷 FOTOGRAFIA"
          : post.type === "video"
            ? "🎬 VIDEOARTE"
            : "🎨 GRAPHIC DESIGN"}
      </div>

      {/* Galleria immagini/video */}
      {mediaList.length > 0 && (
        <div style={{ backgroundColor: "#f3f4f6", padding: "20px" }}>
          <div
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {mediaList.map((url, idx) => (
              <div key={idx} style={{ flexShrink: 0 }}>
                {url.match(/\.(mp4|webm)$/i) ? (
                  <video
                    src={url}
                    controls
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      borderRadius: "8px",
                    }}
                    autoPlay={false}
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Media ${idx + 1}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      borderRadius: "8px",
                      objectFit: "contain",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          {mediaList.length > 1 && (
            <p
              style={{
                textAlign: "center",
                marginTop: "12px",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              📸 {mediaList.length} file multimediali
            </p>
          )}
        </div>
      )}

      {/* Se non ci sono media, mostra icona */}
      {mediaList.length === 0 && (
        <div
          style={{
            backgroundColor:
              post.type === "image"
                ? "#3b82f6"
                : post.type === "video"
                  ? "#ef4444"
                  : "#10b981",
            padding: "60px",
            textAlign: "center",
            fontSize: "80px",
          }}
        >
          {post.type === "image" ? "📷" : post.type === "video" ? "🎬" : "🎨"}
        </div>
      )}

      {/* Contenuto del post */}
      <div style={{ padding: "32px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#1f2937",
          }}
        >
          {post.title}
        </h1>

        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#4b5563",
            marginBottom: "24px",
          }}
        >
          {post.content || "Nessuna descrizione"}
        </p>

        <div
          style={{
            fontSize: "14px",
            color: "#9ca3af",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "16px",
            marginTop: "16px",
          }}
        >
          📅 Pubblicato il {new Date(post.date).toLocaleDateString("it-IT")}
        </div>

        {/* ========== SEZIONE COMMENTI ========== */}
        <CommentsSection
          postId={post.id}
          isAdmin={localStorage.getItem("token") !== null}
        />

        <div style={{ marginTop: "32px" }}>
          <Link to="/blog" style={{ color: "#9333ea", textDecoration: "none" }}>
            ← Torna al blog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
