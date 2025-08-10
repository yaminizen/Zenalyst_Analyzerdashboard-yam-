import { useState } from "react";
import { Card, Table, Alert } from "react-bootstrap";
import Pagination from "./Pagination";

export default function DataTable({ data }) {
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;

  if (!Array.isArray(data)) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">📊 Data Table</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning">
            Data is not in table format (not an array of objects)
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">📊 Data Table</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            No data records found
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const headers = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / recordsPerPage);
  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">📊 Data Table</h5>
        <small className="text-muted">
          {data.length.toLocaleString()} total records
        </small>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <Table striped bordered hover className="mb-0">
            <thead className="table-dark sticky-top">
              <tr>
                {headers.map(col => (
                  <th key={col} className="text-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, idx) => (
                <tr key={startIndex + idx}>
                  {headers.map(col => (
                    <td key={col} className="text-break">
                      {typeof row[col] === 'number' 
                        ? row[col].toLocaleString() 
                        : (() => { 
                            const s = String(row[col] ?? ""); 
                            return s.length > 100 ? s.slice(0,97) + "..." : s; 
                          })()
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
      <Card.Footer>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={goToPage}
          showInfo
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={data.length}
        />
      </Card.Footer>
    </Card>
  );
}



