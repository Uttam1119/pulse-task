import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import VideoPlayer from "./pages/VideoPlayer";
import RequireRole from "./components/RequireRole";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/upload"
          element={
            token ? (
              <RequireRole roles={["editor", "admin"]}>
                <UploadPage />
              </RequireRole>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/video/:id"
          element={token ? <VideoPlayer /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
