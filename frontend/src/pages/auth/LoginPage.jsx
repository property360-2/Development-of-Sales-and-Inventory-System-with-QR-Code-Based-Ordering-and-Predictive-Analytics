import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

export default function LoginPage() {
  const { login, initialize, user, loading, error } = useAuthStore();
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initialize(); // restore session on mount
  }, [initialize]);

  // ✅ if already logged in, redirect immediately
  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "Admin" ? "/admin" : "/cashier", {
        replace: true,
      });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const loggedInUser = await login(form);
      navigate(loggedInUser.role === "Admin" ? "/admin" : "/cashier", {
        replace: true,
      });
    } catch {
      // handled by Zustand
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white shadow-md rounded-md w-80"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border p-2 w-full mb-3 rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 w-full mb-3 rounded"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className={`p-2 w-full rounded text-white ${
              submitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
      )}
    </div>
  );
}
