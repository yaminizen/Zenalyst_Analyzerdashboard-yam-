import PropTypes from "prop-types";
import { Pagination as BSPagination } from "react-bootstrap";

export default function Pagination({
  currentPage,
  totalPages,
  onChange,
  className = "",
  showInfo = false,
  startIndex = 0,
  endIndex = 0,
  totalRecords = 0,
}) {
  const firstPage = 0;
  const lastPage = Math.max(0, totalPages - 1);

  const canGoPrev = currentPage > firstPage;
  const canGoNext = currentPage < lastPage;

  const goto = (page) => {
    if (page === currentPage) return;
    if (page < firstPage || page > lastPage) return;
    onChange(page);
  };

  const formattedRange = () => {
    const start = Math.min(startIndex + 1, totalRecords);
    const end = Math.min(endIndex, totalRecords);
    return `Showing ${start}-${end} of ${totalRecords.toLocaleString()} records`;
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 7; // Max number of page buttons to show
    
    if (totalPages <= maxButtons) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);
      
      // Calculate range around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages - 2, currentPage + 2);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= 3) {
        end = Math.min(totalPages - 2, 4);
      }
      if (currentPage >= totalPages - 4) {
        start = Math.max(1, totalPages - 5);
      }
      
      // Add ellipsis if needed
      if (start > 1) {
        pages.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        if (i !== 0 && i !== totalPages - 1) {
          pages.push(i);
        }
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 2) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  return (
    <div className={`d-flex flex-column align-items-center gap-2 ${className}`.trim()}>
      {showInfo && (
        <small className="text-muted">{formattedRange()}</small>
      )}
      
      <BSPagination className="mb-0" size="sm">
        <BSPagination.Prev 
          onClick={() => goto(currentPage - 1)} 
          disabled={!canGoPrev}
        />
        
        {getPageNumbers().map((pageNum) => {
          if (typeof pageNum === 'string') {
            // Ellipsis
            return <BSPagination.Ellipsis key={pageNum} disabled />;
          }
          
          return (
            <BSPagination.Item
              key={pageNum}
              active={currentPage === pageNum}
              onClick={() => goto(pageNum)}
            >
              {pageNum + 1}
            </BSPagination.Item>
          );
        })}
        
        <BSPagination.Next 
          onClick={() => goto(currentPage + 1)} 
          disabled={!canGoNext}
        />
      </BSPagination>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  showInfo: PropTypes.bool,
  startIndex: PropTypes.number,
  endIndex: PropTypes.number,
  totalRecords: PropTypes.number,
};


