import { useEffect, useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const nav = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user || !user.email) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return window.location.replace("/login");
  }

  const load = async () => {
    const res = await api.get("/videos");
    setVideos(res.data.videos);
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
      alert("Deleted");
      load();
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const canEdit = user.role === "editor" || user.role === "admin";

  const openVideo = (video) => setSelectedVideo(video);
  const closeVideo = () => setSelectedVideo(null);

  const getVideoSrc = (id) =>
    `${
      import.meta.env.VITE_API_BASE || "http://localhost:4000"
    }/api/videos/stream/${id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col relative">
      <header className="flex justify-between items-center p-6 shadow-sm bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <span>Video Library</span>
        </h1>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            {user.email} ▾
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-fade-in">
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
        {canEdit && (
          <div className="mb-6 self-end">
            <Link
              to="/upload"
              className="inline-block px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
            >
              Upload Video
            </Link>
          </div>
        )}

        {videos.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-lg">
            No videos found. {canEdit && "Upload one to get started!"}
          </div>
        ) : (
          <div className="flex flex-col w-full gap-5">
            {videos.map((v) => (
              <div
                key={v._id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
              >
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-800">
                    {v.filename}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Status: <span className="font-medium">{v.status}</span> •
                    Sensitivity:{" "}
                    <span className="font-medium">{v.sensitivity}</span> •
                    Progress:{" "}
                    <span className="font-medium text-blue-600">
                      {v.progress}%
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

                  {canEdit && (
                    <button
                      onClick={() => deleteVideo(v._id)}
                      className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      Delete
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
              className="
          rounded-lg
          shadow-2xl
          object-contain
          max-h-[85vh]
          max-w-[90vw]
          bg-black
        "
            />

            <div className="mt-3 text-center text-gray-300">
              <h2 className="text-lg font-semibold text-white mb-1">
                {selectedVideo.originalName}
              </h2>
              <p className="text-sm">
                Sensitivity:{" "}
                <b className="text-blue-300">{selectedVideo.sensitivity}</b>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
