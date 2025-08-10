import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb as BSBreadcrumb } from 'react-bootstrap';

export default function Breadcrumb() {
  const location = useLocation();

  const breadcrumbItems = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const filename = params.get("filename");
    
    if (location.pathname === '/file' && filename) {
      return [
        { label: 'Home', href: '/' },
        { label: filename, active: true }
      ];
    }
    
    if (location.pathname === '/') {
      return [
        { label: 'Home', active: true }
      ];
    }
    
    return [
      { label: 'Home', href: '/' },
      { label: 'Page', active: true }
    ];
  }, [location.pathname, location.search]);

  return (
    <div className="breadcrumb-wrapper">
      <BSBreadcrumb>
        {breadcrumbItems.map((item, index) => (
          <BSBreadcrumb.Item
            key={index}
            active={item.active}
            href={item.href}
            className={item.active ? 'text-primary' : ''}
          >
            {item.label}
          </BSBreadcrumb.Item>
        ))}
      </BSBreadcrumb>
    </div>
  );
}