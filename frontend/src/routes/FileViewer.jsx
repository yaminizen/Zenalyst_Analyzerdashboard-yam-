import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Alert, Card, Spinner } from "react-bootstrap";
import DataTable from "../components/DataTable";
import Charts from "../components/Charts";

const backend = import.meta.env.VITE_BACKEND_URL;

export default function FileViewer() {
  const [searchParams] = useSearchParams();
  const filename = searchParams.get("filename");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filename) return;
    
    setLoading(true);
    setError(null);
    
    axios.get(`${backend}/data`, { params: { filename } })
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error("Failed to load data:", err);
        setError("Failed to load data. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filename]);

  if (!filename) {
    return (
      <Container>
        <Alert variant="warning">
          <Alert.Heading>No File Selected</Alert.Heading>
          <p>Please select a JSON file from the sidebar to view its contents.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" className="me-2" />
        <span>Loading file data...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          <Alert.Heading>Error Loading File</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <Alert variant="info">
          <Alert.Heading>No Data Available</Alert.Heading>
          <p>The selected file appears to be empty or contains no readable data.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">📄 {filename}</h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-0">
                Viewing JSON data from: <code>{filename}</code>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <DataTable data={data} />
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Charts data={data} />
        </Col>
      </Row>
    </Container>
  );
}
