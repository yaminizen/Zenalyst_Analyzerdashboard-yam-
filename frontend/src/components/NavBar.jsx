import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar({ files = [], title = "S3 JSON Viewer" }) {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeFilename = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get("filename") || "";
    } catch {
      return "";
    }
  }, [location.search]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.toLowerCase().includes(q));
  }, [files, query]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname, location.search]);

  // Close on Escape
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setIsSidebarOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <button
          className="hamburger-btn"
          aria-label="Open navigation"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen(true)}
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>
        <div className="nav-brand">
          <Link to="/" className="nav-brand-link">{title}</Link>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`} aria-hidden={!isSidebarOpen}>
        <div className="sidebar-header">
          <div className="sidebar-title">{title}</div>
          <button className="sidebar-close" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        <div className="sidebar-search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search JSON files..."
            aria-label="Search JSON files"
            className="nav-search-input"
          />
        </div>
        <nav className="sidebar-links" aria-label="JSON files">
          {filtered.length === 0 ? (
            <div className="nav-empty">No files</div>
          ) : (
            filtered.map((file) => {
              const isActive = activeFilename === file;
              return (
                <Link
                  key={file}
                  to={`/file?filename=${encodeURIComponent(file)}`}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  title={file}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {file}
                </Link>
              );
            })
          )}
        </nav>
      </aside>
    </header>
  );
}


