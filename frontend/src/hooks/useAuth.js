import { useState, useEffect } from "react";
import api from "../api/api";

export default function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null));
  }, []);
  return { user, setUser };
}
