import { BrowserRouter, Routes, Route } from "react-router-dom";
import FileViewer from "./routes/FileViewer";
import AdminLayout from "./layouts/AdminLayout";
import { ConfigProvider } from "./contexts/ConfigContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/scss/style.scss';

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={
              <div className="card">
                <div className="card-body text-center">
                  <h4 className="card-title">Welcome to Zenalyst Analyzer</h4>
                  <p className="card-text text-muted">
                    Select a file from the sidebar to begin viewing and analyzing your data.
                  </p>
                </div>
              </div>
            } />
            <Route path="/file" element={<FileViewer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
