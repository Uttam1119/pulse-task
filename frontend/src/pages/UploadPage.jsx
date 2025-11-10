import React, { useState, useEffect } from "react";
import api from "../api/api";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const SOCKET_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoId, setVideoId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!videoId) return;
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      socket.emit("subscribe", { videoId });
    });

    socket.on("processing:update", ({ progress }) => {
      setUploadProgress(progress);
    });

    socket.on("processing:done", ({ sensitivity }) => {
      alert("Processing complete: " + sensitivity);
      nav("/");
    });

    return () => socket.disconnect();
  }, [videoId]);

  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a video");

    const fd = new FormData();
    fd.append("video", file);

    try {
      setIsUploading(true);
      const res = await api.post("/videos/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          const progress = Math.round((p.loaded / p.total) * 100);
          setUploadProgress(progress);
        },
      });
      setVideoId(res.data.video._id);
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Upload Video
        </h2>

        <form onSubmit={onUpload} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded-lg p-3 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
            {file && (
              <p className="mt-2 text-gray-600 text-sm">
                🎬 <b>{file.name}</b>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-3 text-white font-semibold rounded-lg shadow-md transition ${
              isUploading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>

        {isUploading || uploadProgress > 0 ? (
          <div className="mt-6">
            <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="h-4 bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300"
              ></div>
            </div>
            <p className="mt-2 text-center text-gray-700 font-medium">
              {uploadProgress}% Completed
            </p>
          </div>
        ) : null}

        <button
          onClick={() => nav("/")}
          className="w-full mt-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg shadow transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
