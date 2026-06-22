import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import Privacy from "./pages/Privacy";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";
import CookieBanner from "./components/CookieBanner";
import SEO from "./components/SEO";
import { useTheme, ThemeProvider } from "./contexts/ThemeContext";

import NebulaChat from "./components/NebulaChat/NebulaChat";
import ChatPage from "./chat/chatPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios
        .get("/api/profile")
        .then((res) => setUser(res.data))
        .catch(() => logout());
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <BrowserRouter>
      <AppContent
        token={token}
        setToken={setToken}
        user={user}
        logout={logout}
      />
    </BrowserRouter>
  );
}

function AppContent({ token, setToken, user, logout }) {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: darkMode ? "#1f2937" : "#f3f4f6",
        color: darkMode ? "#f3f4f6" : "#1f2937",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <nav
        style={{
          backgroundColor: darkMode ? "#374151" : "white",
          padding: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <Link
            to="/"
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#9333ea",
              textDecoration: "none",
            }}
          >
            CreativePortfolio
          </Link>

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: darkMode ? "#f3f4f6" : "#333",
              }}
            >
              Home
            </Link>
            <Link
              to="/blog"
              style={{
                textDecoration: "none",
                color: darkMode ? "#f3f4f6" : "#333",
              }}
            >
              Blog
            </Link>
            <Link
              to="/contacts"
              style={{
                textDecoration: "none",
                color: darkMode ? "#f3f4f6" : "#333",
              }}
            >
              Contatti
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  style={{
                    textDecoration: "none",
                    color: darkMode ? "#f3f4f6" : "#333",
                  }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    cursor: "pointer",
                  }}
                >
                  Esci
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: darkMode ? "#f3f4f6" : "#333",
                }}
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                padding: "4px 8px",
                borderRadius: "8px",
                backgroundColor: darkMode ? "#4b5563" : "#e5e7eb",
              }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        <Routes>
          <Route path="/" element={<Home user={user} token={token} />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/post/:id" element={<PostDetail />} />

          <Route
            path="/chat"
            element={<ChatPage token={token} user={user} />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* <NebulaChat /> */}

      <CookieBanner />
    </div>
  );
}

function Home({ user, token }) {
  const [settings, setSettings] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/settings").then((res) => setSettings(res.data));
  }, []);

  const goToBlogWithFilter = (filterType) => {
    navigate(`/blog?filter=${filterType}`);
  };
  console.log("HOME USER:", user);
  console.log("HOME TOKEN:", token);

  return (
    <>
      <SEO
        title="Home"
        description="Benvenuto nel mio portfolio creativo. Fotografia, videoarte e graphic design."
      />
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#9333ea",
            marginBottom: "16px",
          }}
        >
          {settings.site_name || "Il Mio Portfolio"}
        </h1>
        <p style={{ fontSize: "20px", color: "#4b5563", marginBottom: "48px" }}>
          {settings.bio || "Benvenuti nel mio sito!"}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          <div
            onClick={() => goToBlogWithFilter("image")}
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷</div>
            <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Fotografia
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Scatti unici che raccontano storie
            </p>
            <span
              style={{ color: "#9333ea", fontSize: "14px", fontWeight: "500" }}
            >
              Scopri di più →
            </span>
          </div>
          <div
            onClick={() => goToBlogWithFilter("video")}
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
            <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Videoarte
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Contenuti visivi emozionanti
            </p>
            <span
              style={{ color: "#9333ea", fontSize: "14px", fontWeight: "500" }}
            >
              Scopri di più →
            </span>
          </div>
          <div
            onClick={() => goToBlogWithFilter("graphic")}
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎨</div>
            <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Graphic Design
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Design innovativi e creativi
            </p>
            <span
              style={{ color: "#9333ea", fontSize: "14px", fontWeight: "500" }}
            >
              Scopri di più →
            </span>
          </div>

          <div
            onClick={() => {
              if (!user || !token) {
                alert(
                  "Devi essere registrato e loggato per accedere alla chat.",
                );
                return;
              }
              window.open("/chat", "ChatWindow", "resizable=yes");

              window.resizeTo(
                document.body.scrollWidth + 50,
                document.body.scrollHeight + 50,
              );
            }}
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
            <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Chatta con me
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Parla con gli utenti online
            </p>
            <span
              style={{ color: "#9333ea", fontSize: "14px", fontWeight: "500" }}
            >
              Entra nella chat →
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function Blog() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const postsPerPage = 6;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get("filter");
    const searchParam = params.get("search");
    if (filterParam && ["image", "video", "graphic"].includes(filterParam)) {
      setFilter(filterParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    axios
      .get("/api/posts")
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Errore:", err);
        setLoading(false);
      });
  }, []);

  const changeFilter = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (newFilter !== "all") params.set("filter", newFilter);
    if (searchTerm) params.set("search", searchTerm);
    navigate(`/blog?${params.toString()}`);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (term) params.set("search", term);
    navigate(`/blog?${params.toString()}`);
  };

  const filteredByType =
    filter === "all" ? posts : posts.filter((p) => p.type === filter);
  const filteredBySearch = filteredByType.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.content && p.content.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const getSortedPosts = () => {
    const postsCopy = [...filteredBySearch];
    switch (sortBy) {
      case "date-desc":
        return postsCopy.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "date-asc":
        return postsCopy.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "title-asc":
        return postsCopy.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return postsCopy.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return postsCopy;
    }
  };

  const sortedPosts = getSortedPosts();
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Caricamento post...
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Blog"
        description="Esplora tutti i miei lavori di fotografia, videoarte e graphic design."
      />
      <div>
        <h1
          style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}
        >
          Blog Creativo
        </h1>

        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Cerca per titolo o contenuto..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "30px",
              border: "1px solid #ddd",
              fontSize: "16px",
              outline: "none",
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            <option value="date-desc">📅 Più recenti</option>
            <option value="date-asc">📅 Meno recenti</option>
            <option value="title-asc">🔤 Titolo A-Z</option>
            <option value="title-desc">🔤 Titolo Z-A</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => changeFilter("all")}
            style={{
              padding: "8px 20px",
              borderRadius: "25px",
              border: "none",
              cursor: "pointer",
              backgroundColor: filter === "all" ? "#9333ea" : "#e5e7eb",
              color: filter === "all" ? "white" : "#333",
            }}
          >
            📋 Tutti
          </button>
          <button
            onClick={() => changeFilter("image")}
            style={{
              padding: "8px 20px",
              borderRadius: "25px",
              border: "none",
              cursor: "pointer",
              backgroundColor: filter === "image" ? "#3b82f6" : "#e5e7eb",
              color: filter === "image" ? "white" : "#333",
            }}
          >
            📷 Foto
          </button>
          <button
            onClick={() => changeFilter("video")}
            style={{
              padding: "8px 20px",
              borderRadius: "25px",
              border: "none",
              cursor: "pointer",
              backgroundColor: filter === "video" ? "#ef4444" : "#e5e7eb",
              color: filter === "video" ? "white" : "#333",
            }}
          >
            🎬 Video
          </button>
          <button
            onClick={() => changeFilter("graphic")}
            style={{
              padding: "8px 20px",
              borderRadius: "25px",
              border: "none",
              cursor: "pointer",
              backgroundColor: filter === "graphic" ? "#10b981" : "#e5e7eb",
              color: filter === "graphic" ? "white" : "#333",
            }}
          >
            🎨 Graphic
          </button>
        </div>

        {searchTerm && (
          <div
            style={{ marginBottom: "16px", fontSize: "14px", color: "#6b7280" }}
          >
            🔍 {filteredBySearch.length} risultati per "{searchTerm}"
          </div>
        )}

        {currentPosts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              backgroundColor: "white",
              borderRadius: "8px",
            }}
          >
            <p>Nessun post trovato.</p>
            {searchTerm && <p>Prova con un'altra parola chiave.</p>}
            <p>
              <Link to="/dashboard" style={{ color: "#9333ea" }}>
                Clicca qui
              </Link>{" "}
              per creare il tuo primo post!
            </p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "24px",
          }}
        >
          {currentPosts.map((post) => (
            <Link
              to={`/post/${post.id}`}
              key={post.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }}
              >
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "2px",
                      overflowX: "auto",
                      backgroundColor: "#f3f4f6",
                    }}
                  >
                    {post.mediaUrls.slice(0, 3).map((url, idx) => (
                      <div key={idx} style={{ flexShrink: 0 }}>
                        {url.match(/\.(mp4|webm)$/i) ? (
                          <video
                            src={url}
                            style={{
                              width: "120px",
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`Media ${idx + 1}`}
                            style={{
                              width: "120px",
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </div>
                    ))}
                    {post.mediaUrls.length > 3 && (
                      <div
                        style={{
                          width: "120px",
                          height: "120px",
                          backgroundColor: "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        +{post.mediaUrls.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {(!post.mediaUrls || post.mediaUrls.length === 0) && (
                  <div
                    style={{
                      backgroundColor:
                        post.type === "image"
                          ? "#3b82f6"
                          : post.type === "video"
                            ? "#ef4444"
                            : "#10b981",
                      padding: "40px",
                      textAlign: "center",
                      fontSize: "48px",
                    }}
                  >
                    {post.type === "image"
                      ? "📷"
                      : post.type === "video"
                        ? "🎬"
                        : "🎨"}
                  </div>
                )}

                <div style={{ padding: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#1f2937",
                    }}
                  >
                    {post.title}
                  </h3>

                  {post.tags && post.tags.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                        marginBottom: "10px",
                      }}
                    >
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: "10px",
                            backgroundColor: "#f3e8ff",
                            color: "#9333ea",
                            padding: "2px 8px",
                            borderRadius: "12px",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p
                    style={{
                      color: "#4b5563",
                      margin: "0 0 15px 0",
                      lineHeight: "1.5",
                      fontSize: "14px",
                    }}
                  >
                    {post.content?.substring(0, 100)}
                    {post.content?.length > 100 ? "..." : ""}
                  </p>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: "10px",
                    }}
                  >
                    📅 {new Date(post.date).toLocaleDateString("it-IT")}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "32px",
            }}
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              ← Precedente
            </button>
            <span style={{ padding: "8px 16px" }}>
              Pagina {currentPage} di {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              Successiva →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Contacts() {
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get("/api/settings").then((res) => setSettings(res.data));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Il nome è obbligatorio";
    else if (formData.name.length < 2)
      newErrors.name = "Il nome deve avere almeno 2 caratteri";

    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!formData.email) newErrors.email = "L'email è obbligatoria";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Inserisci un'email valida";

    if (!formData.message.trim())
      newErrors.message = "Il messaggio è obbligatorio";
    else if (formData.message.length < 10)
      newErrors.message = "Il messaggio deve avere almeno 10 caratteri";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSending(true);
    try {
      await axios.post("/api/contacts", formData);
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSuccess(null), 5000);
    } catch {
      setSuccess(false);
      setTimeout(() => setSuccess(null), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <SEO
        title="Contatti"
        description="Contattami per collaborazioni, progetti o semplicemente per fare due chiacchiere."
      />
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1
          style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}
        >
          Contattami
        </h1>
        {success === true && (
          <div
            style={{
              backgroundColor: "#d1fae5",
              color: "#065f46",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            ✅ Messaggio inviato con successo!
          </div>
        )}
        {success === false && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            ❌ Errore nell'invio. Riprova.
          </div>
        )}
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <p>
            📧 <strong>Email:</strong>{" "}
            {settings.contact_email || "info@example.com"}
          </p>
          <p>
            📱 <strong>Telefono:</strong> +39 123 456 789
          </p>
          <hr style={{ margin: "20px 0" }} />
          <h3>Scrivimi un messaggio</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Il tuo nome"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "12px",
                border: errors.name ? "2px solid #ef4444" : "1px solid #ddd",
                borderRadius: "8px",
              }}
            />
            {errors.name && (
              <p style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.name}
              </p>
            )}
            <input
              type="email"
              name="email"
              placeholder="La tua email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "12px",
                border: errors.email ? "2px solid #ef4444" : "1px solid #ddd",
                borderRadius: "8px",
              }}
            />
            {errors.email && (
              <p style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.email}
              </p>
            )}
            <textarea
              name="message"
              placeholder="Il tuo messaggio"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows="5"
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "16px",
                border: errors.message ? "2px solid #ef4444" : "1px solid #ddd",
                borderRadius: "8px",
              }}
            ></textarea>
            {errors.message && (
              <p style={{ color: "#ef4444", fontSize: "12px" }}>
                {errors.message}
              </p>
            )}
            <button
              type="submit"
              disabled={sending}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#9333ea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                opacity: sending ? 0.7 : 1,
              }}
            >
              {sending ? "Invio in corso..." : "Invia messaggio"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://webapp-with-chat.onrender.com/api/login",
        { username, password },
      );

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      navigate("/dashboard");
    } catch {
      alert("Credenziali errate");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "32px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
      >
        Login Admin
      </h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#9333ea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Accedi
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "12px", marginTop: "16px" }}>
        admin / admin123
      </p>
    </div>
  );
}

function Dashboard({ token }) {
  const [posts, setPosts] = useState([]);
  const [settings, setSettings] = useState({});
  const [pendingComments, setPendingComments] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "image",
    mediaFiles: [],
    tags: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editingMediaUrls, setEditingMediaUrls] = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    const postsRes = await axios.get("/api/posts");
    const settingsRes = await axios.get("/api/settings");
    const commentsRes = await axios.get("/api/admin/comments/pending");
    setPosts(postsRes.data);
    setSettings(settingsRes.data);
    setPendingComments(commentsRes.data);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm({ ...form, mediaFiles: files });
    const previews = [];
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === files.length) setUploadPreviews(previews);
        };
        reader.readAsDataURL(file);
      } else {
        previews.push(null);
        if (previews.length === files.length) setUploadPreviews(previews);
      }
    });
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditingMediaUrls(post.mediaUrls || []);
    setForm({
      title: post.title,
      content: post.content || "",
      type: post.type,
      mediaFiles: [],
      tags: post.tags ? post.tags.join(", ") : "",
    });
    setUploadPreviews([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingMediaUrls([]);
    setForm({
      title: "",
      content: "",
      type: "image",
      mediaFiles: [],
      tags: "",
    });
    setUploadPreviews([]);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();

    console.log("📤 Valore di form.tags PRIMA dell'invio:", form.tags);

    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("content", form.content);
    fd.append("type", form.type);
    fd.append("tags", form.tags || "");

    console.log("📤 Tags inviati nel FormData:", form.tags); // <-- LOG

    form.mediaFiles.forEach((file) => fd.append("media", file));

    // 🔧 SALVATAGGIO POST (create + update)
    try {
      if (editingId) {
        const replace = confirm("Vuoi SOSTITUIRE le immagini esistenti?");
        fd.append("replaceMedia", replace);

        await axios.put(
          `https://webapp-with-chat.onrender.com/api/posts/${editingId}`,
          fd,
        );

        alert("Post modificato con successo!");
      } else {
        await axios.post("https://webapp-with-chat.onrender.com/api/posts", fd);
      }

      cancelEdit();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  // 🔧 CANCELLAZIONE POST
  const handleDeletePost = async (id) => {
    if (confirm("Cancellare questo post?")) {
      await axios.delete(
        `https://webapp-with-chat.onrender.com/api/posts/${id}`,
      );
      await fetchData();
    }
  };

  // 🔧 SALVATAGGIO SETTINGS
  const handleSaveSettings = async () => {
    await axios.put(
      "https://webapp-with-chat.onrender.com/api/settings",
      settings,
    );
    alert("Impostazioni salvate!");
  };

  // 🔧 APPROVA COMMENTO
  const approveComment = async (id) => {
    await axios.put(
      `https://webapp-with-chat.onrender.com/api/admin/comments/${id}/approve`,
    );

    setPendingComments(pendingComments.filter((c) => c.id !== id));
    alert("Commento approvato!");
  };

  // 🔧 RIFIUTA COMMENTO
  const rejectComment = async (id) => {
    if (
      confirm("Rifiutare questo commento? Verrà eliminato permanentemente.")
    ) {
      await axios.delete(
        `https://webapp-with-chat.onrender.com/api/admin/comments/${id}`,
      );

      setPendingComments(pendingComments.filter((c) => c.id !== id));
      alert("Commento rifiutato ed eliminato");
    }
  };

  // 🔧 ESPORTAZIONE GDPR
  const exportData = async () => {
    const res = await axios.get(
      "https://webapp-with-chat.onrender.com/api/gdpr/export",
    );

    const dataStr = JSON.stringify(res.data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `gdpr-export-${new Date().toISOString()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  if (!token) return <div>Caricamento...</div>;

  return (
    <div>
      <h1
        style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}
      >
        Dashboard
      </h1>

      <div
        style={{
          backgroundColor: editingId ? "#fef3c7" : "white",
          padding: "24px",
          borderRadius: "8px",
          marginBottom: "32px",
          border: editingId ? "2px solid #f59e0b" : "none",
        }}
      >
        <h2
          style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}
        >
          {editingId ? "✏️ Modifica Post" : "➕ Nuovo Post"}
        </h2>
        {editingId && (
          <div
            style={{
              backgroundColor: "#fef3c7",
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              🟡 Stai modificando: <strong>{form.title}</strong>
            </span>
            <button
              onClick={cancelEdit}
              style={{
                background: "none",
                border: "none",
                color: "#d97706",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Annulla ✖
            </button>
          </div>
        )}
        <form onSubmit={handleSavePost}>
          <input
            type="text"
            placeholder="Titolo"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            required
          />
          <textarea
            placeholder="Contenuto"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows="3"
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          ></textarea>

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="image">📷 Foto</option>
            <option value="video">🎬 Video</option>
            <option value="graphic">🎨 Graphic Design</option>
          </select>

          <input
            type="text"
            placeholder="🏷️ Tag (separati da virgola, es: natura, ritratto, street)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />

          {editingId && editingMediaUrls.length > 0 && (
            <div
              style={{
                marginBottom: "12px",
                padding: "8px",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
              }}
            >
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Media attuali ({editingMediaUrls.length}):
              </span>
              {editingMediaUrls.map((url, idx) => (
                <div key={idx} style={{ fontSize: "12px" }}>
                  📎 {url}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              📂 Carica file (max 5, fino a 50MB ciascuno)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ width: "100%" }}
            />
            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
              Puoi selezionare più file contemporaneamente (Ctrl+click)
            </p>
          </div>

          {uploadPreviews.length > 0 && (
            <div
              style={{
                marginBottom: "12px",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {uploadPreviews.map(
                (preview, idx) =>
                  preview && (
                    <img
                      key={idx}
                      src={preview}
                      alt="Anteprima"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    />
                  ),
              )}
              <span
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  alignSelf: "center",
                }}
              >
                {uploadPreviews.length} file selezionati
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 20px",
                backgroundColor: editingId ? "#f59e0b" : "#9333ea",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving
                ? "⏳ Salvataggio..."
                : editingId
                  ? "✏️ Aggiorna Post"
                  : "💾 Salva Post"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Annulla
              </button>
            )}
          </div>
        </form>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
        }}
      >
        <h2
          style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}
        >
          Post Esistenti ({posts.length})
        </h2>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              borderBottom: "1px solid #eee",
              padding: "12px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <strong>{post.title}</strong>{" "}
              <span style={{ color: "#6b7280", fontSize: "12px" }}>
                ({post.type})
              </span>
              {post.tags && post.tags.length > 0 && (
                <span
                  style={{
                    color: "#9333ea",
                    fontSize: "10px",
                    marginLeft: "8px",
                  }}
                >
                  🏷️ {post.tags.join(", ")}
                </span>
              )}
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                {new Date(post.date).toLocaleDateString("it-IT")}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link
                to={`/post/${post.id}`}
                target="_blank"
                style={{ color: "#3b82f6", textDecoration: "none" }}
              >
                👁️ Anteprima
              </Link>
              <button
                onClick={() => startEdit(post)}
                style={{
                  color: "#f59e0b",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✏️ Modifica
              </button>
              <button
                onClick={() => handleDeletePost(post.id)}
                style={{
                  color: "#dc2626",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                🗑️ Cancella
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          marginTop: "32px",
        }}
      >
        <h2
          style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}
        >
          💬 Commenti in attesa ({pendingComments.length})
        </h2>
        {pendingComments.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "20px" }}>
            Nessun commento in attesa.
          </p>
        ) : (
          pendingComments.map((comment) => (
            <div
              key={comment.id}
              style={{ borderBottom: "1px solid #eee", padding: "16px 0" }}
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
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {new Date(comment.created_at).toLocaleString("it-IT")}
                </span>
              </div>
              <p style={{ margin: "8px 0", color: "#4b5563" }}>
                {comment.content}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "12px",
                }}
              >
                Post:{" "}
                {posts.find((p) => p.id === comment.post_id)?.title ||
                  "Post sconosciuto"}
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => approveComment(comment.id)}
                  style={{
                    padding: "6px 16px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  ✅ Approva
                </button>
                <button
                  onClick={() => rejectComment(comment.id)}
                  style={{
                    padding: "6px 16px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  ❌ Rifiuta
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          marginTop: "32px",
        }}
      >
        <h2
          style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}
        >
          ⚙️ Impostazioni Sito
        </h2>
        <input
          type="text"
          value={settings.site_name || ""}
          onChange={(e) =>
            setSettings({ ...settings, site_name: e.target.value })
          }
          placeholder="Nome sito"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <textarea
          value={settings.bio || ""}
          onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
          placeholder="Bio"
          rows="3"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        ></textarea>
        <input
          type="email"
          value={settings.contact_email || ""}
          onChange={(e) =>
            setSettings({ ...settings, contact_email: e.target.value })
          }
          placeholder="Email"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <button
            onClick={handleSaveSettings}
            style={{
              padding: "10px 20px",
              backgroundColor: "#9333ea",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            💾 Salva Impostazioni
          </button>
          <button
            onClick={exportData}
            style={{
              padding: "10px 20px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            📥 Esporta i miei dati (GDPR)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
