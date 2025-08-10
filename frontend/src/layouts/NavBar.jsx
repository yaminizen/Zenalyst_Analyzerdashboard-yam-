import { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { ConfigContext } from '../contexts/ConfigContext';

export default function NavBar({ onToggleMenu }) {
  const configContext = useContext(ConfigContext);
  const { headerBackColor, collapseHeaderMenu } = configContext.state;

  let headerClass = ['pc-header'];
  if (headerBackColor) {
    headerClass.push(headerBackColor);
  }
  if (collapseHeaderMenu) {
    headerClass.push('mob-header-active');
  }

  return (
    <header className={headerClass.join(' ')}>
      <Navbar expand="lg" className="header-wrapper px-0">
        <div className="d-flex align-items-center">
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            onClick={onToggleMenu}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <Navbar.Brand href="/" className="d-flex align-items-center ms-2">
            <img 
              src="/zenalyst ai.jpg" 
              alt="Zenalyst AI" 
              style={{ height: '40px', width: 'auto' }}
            />
          </Navbar.Brand>
        </div>
        
        <Nav className="ms-auto">
          <div className="d-flex align-items-center text-muted">
            <small>DashboardKit Theme</small>
          </div>
        </Nav>
      </Navbar>
    </header>
  );
}