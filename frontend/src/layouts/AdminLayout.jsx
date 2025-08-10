import { useContext, useEffect, Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Navigation from './Navigation';
import Breadcrumb from './Breadcrumb';
import useWindowSize from '../hooks/useWindowSize';
import { ConfigContext } from '../contexts/ConfigContext';
import * as actionType from '../store/actions';

const Loader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export default function AdminLayout() {
  const windowSize = useWindowSize();
  const configContext = useContext(ConfigContext);
  const { collapseLayout, collapseMenu } = configContext.state;
  const { dispatch } = configContext;
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (windowSize.width > 992 && windowSize.width <= 1024) {
      dispatch({ type: actionType.COLLAPSE_MENU });
    }
  }, [dispatch, windowSize]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    if (windowSize.width <= 991.98) {
      setShowOverlay(!showOverlay);
      dispatch({ type: actionType.COLLAPSE_MENU });
    } else {
      dispatch({ type: actionType.COLLAPSE_MENU });
    }
  };

  let containerClass = ['pc-container'];
  if (collapseLayout) {
    containerClass.push('minimized');
  }

  return (
    <>
      <NavBar onToggleMenu={toggleMobileMenu} />
      <Navigation isOpen={collapseMenu} onClose={() => setShowOverlay(false)} />
      
      {/* Mobile overlay */}
      {showOverlay && windowSize.width <= 991.98 && (
        <div className="pc-overlay" onClick={() => {
          setShowOverlay(false);
          dispatch({ type: actionType.COLLAPSE_MENU });
        }} />
      )}
      
      <div className={containerClass.join(' ')}>
        <div className="pcoded-content">
          <Breadcrumb />
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </>
  );
}