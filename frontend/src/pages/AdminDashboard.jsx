import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function AdminDashboard() {
  const [videos, setVideos] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filterTenant, setFilterTenant] = useState("all");
  const [filterSensitivity, setFilterSensitivity] = useState("all");
  const [tenants, setTenants] = useState([]);
  const nav = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user || !user.email) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return window.location.replace("/login");
  }

  const load = async () => {
    try {
      const res = await api.get("/videos/admin/all");
      const vids = res.data.videos || [];
      setVideos(vids);
      const tenantList = [
        ...new Set(vids.map((v) => v.owner?.tenantId).filter(Boolean)),
      ];
      setTenants(tenantList);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      alert("Failed to load videos");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  const deleteVideo = async (id) => {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/videos/${id}`);
      alert("Deleted successfully");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const toggleSensitivity = async (id, newSensitivity) => {
    try {
      await api.patch(`/videos/${id}`, { sensitivity: newSensitivity });
      alert(`Marked as ${newSensitivity}`);
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to update sensitivity");
    }
  };

  const openVideo = (video) => setSelectedVideo(video);
  const closeVideo = () => setSelectedVideo(null);

  const getVideoSrc = (id) =>
    `${
      import.meta.env.VITE_API_BASE || "http://localhost:4000"
    }/api/videos/stream/${id}`;

  const filteredVideos = videos
    .filter((v) =>
      filterTenant === "all" ? true : v.owner?.tenantId === filterTenant
    )
    .filter((v) =>
      filterSensitivity === "all" ? true : v.sensitivity === filterSensitivity
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col relative">
      <header className="flex justify-between items-center p-6 shadow-sm bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <span>Admin Dashboard</span>
        </h1>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            {user.email} ▾
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 text-gray-700 text-sm border-b">
                Role: <b>{user.role}</b>
              </div>
              <div className="px-4 py-3 text-gray-700 text-sm border-b">
                Tenant: <b>{user.tenantId}</b>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-col items-center w-full max-w-5xl mx-auto p-6 flex-1">
        <div className="mb-6 w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <Link
            to="/upload"
            className="inline-block px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition self-start md:self-auto"
          >
            Upload Video
          </Link>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 font-medium">
                Filter by Tenant:
              </label>
              <select
                value={filterTenant}
                onChange={(e) => setFilterTenant(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All</option>
                {tenants.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 font-medium">
                Filter by Sensitivity:
              </label>
              <select
                value={filterSensitivity}
                onChange={(e) => setFilterSensitivity(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="safe">Safe</option>
                <option value="flagged">Flagged</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-lg">
            No videos found.
          </div>
        ) : (
          <div className="flex flex-col w-full gap-5">
            {filteredVideos.map((v) => (
              <div
                key={v._id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
              >
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-800">
                    {v.filename}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Tenant:{" "}
                    <span className="font-medium text-gray-700">
                      {v.owner?.tenantId}
                    </span>{" "}
                    • Uploader:{" "}
                    <span className="font-medium text-gray-700">
                      {v.owner?.email}
                    </span>{" "}
                    • Sensitivity:{" "}
                    <span
                      className={`font-medium ${
                        v.sensitivity === "flagged"
                          ? "text-red-600"
                          : v.sensitivity === "safe"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {v.sensitivity}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0">
                  <button
                    onClick={() => openVideo(v)}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Play
                  </button>

                  <button
                    onClick={() => deleteVideo(v._id)}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Delete
                  </button>

                  {v.sensitivity === "flagged" ? (
                    <button
                      onClick={() => toggleSensitivity(v._id, "safe")}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Mark Safe
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleSensitivity(v._id, "flagged")}
                      className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
                    >
                      Mark Flagged
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeVideo}
        >
          <div
            className="relative flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideo}
              className="absolute -top-10 right-0 text-gray-300 hover:text-white text-3xl font-bold"
            >
              ✕
            </button>

            <video
              src={getVideoSrc(selectedVideo._id)}
              controls
              autoPlay
              className="rounded-lg shadow-2xl object-contain max-h-[85vh] max-w-[90vw] bg-black"
            />

            <div className="mt-3 text-center text-gray-300">
              <h2 className="text-lg font-semibold text-white mb-1">
                {selectedVideo.originalName}
              </h2>
              <p className="text-sm">
                Tenant:{" "}
                <b className="text-blue-300">{selectedVideo.owner?.tenantId}</b>{" "}
                | Uploader:{" "}
                <b className="text-blue-300">{selectedVideo.owner?.email}</b>
              </p>
              <p className="text-sm mt-1">
                Sensitivity:{" "}
                <b
                  className={
                    selectedVideo.sensitivity === "flagged"
                      ? "text-red-400"
                      : selectedVideo.sensitivity === "safe"
                      ? "text-green-400"
                      : "text-yellow-300"
                  }
                >
                  {selectedVideo.sensitivity}
                </b>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
