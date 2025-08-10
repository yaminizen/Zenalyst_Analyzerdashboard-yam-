import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import useWindowSize from '../hooks/useWindowSize';
import axios from 'axios';

const backend = import.meta.env.VITE_BACKEND_URL;

export default function Navigation({ isOpen, onClose }) {
  const location = useLocation();
  const configContext = useContext(ConfigContext);
  const windowSize = useWindowSize();
  const { collapseLayout } = configContext.state;
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');

  // Fetch files
  useEffect(() => {
    axios.get(`${backend}/files`)
      .then(res => setFiles(res.data))
      .catch(err => console.error("Failed to fetch files:", err));
  }, []);

  // Get active filename from URL
  const activeFilename = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get("filename") || "";
    } catch {
      return "";
    }
  }, [location.search]);

  // Filter files based on search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.toLowerCase().includes(q));
  }, [files, query]);

  let sidebarClass = ['pc-sidebar'];
  if (collapseLayout) {
    sidebarClass.push('minimized');
  }
  if (isOpen && windowSize.width <= 991.98) {
    sidebarClass.push('show');
  }

  return (
    <nav className={sidebarClass.join(' ')}>
      <div className="sidebar-brand">
        <Link to="/" className="text-white text-decoration-none fw-bold">
          📊 S3 JSON Viewer
        </Link>
      </div>
      
      <div className="px-3 py-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search JSON files..."
          className="form-control form-control-sm bg-dark text-white border-secondary"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        />
      </div>
      
      <div className="sidebar-nav">
        <div className="nav-item">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' && !activeFilename ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-icon">🏠</div>
            {!collapseLayout && <span>Home</span>}
          </Link>
        </div>
        
        {filtered.length === 0 ? (
          <div className="nav-item">
            <div className="nav-link text-muted">
              <div className="nav-icon">📄</div>
              {!collapseLayout && <span>No files found</span>}
            </div>
          </div>
        ) : (
          filtered.map((file) => {
            const isActive = activeFilename === file;
            return (
              <div key={file} className="nav-item">
                <Link
                  to={`/file?filename=${encodeURIComponent(file)}`}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  title={file}
                  onClick={onClose}
                >
                  <div className="nav-icon">📄</div>
                  {!collapseLayout && <span>{file}</span>}
                </Link>
              </div>
            );
          })
        )}
      </div>
    </nav>
  );
}