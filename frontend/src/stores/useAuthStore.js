// frontend/src/stores/useAuthStore.js
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    loading: true,
    error: null,

    initialize: async () => {
        console.log("🔄 Initializing auth...");
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("userData");

        if (token && userData) {
            const user = JSON.parse(userData);
            console.log("✅ Restoring session:", user);

            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            set({ token, user, loading: false });
        } else {
            set({ loading: false });
        }
    },

    login: async (credentials) => {
        try {
            const res = await axiosInstance.post("/login", credentials);
            const { token, user } = res.data;

            set({ token, user, error: null });
            localStorage.setItem("authToken", token);
            localStorage.setItem("userData", JSON.stringify(user));

            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return user;
        } catch (err) {
            set({ error: "Invalid credentials" });
            throw err;
        }
    },

    // ✅ Updated logout with backend call
    logout: async () => {
        try {
            // Call backend to revoke token
            await axiosInstance.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
            // Continue logout even if API fails
        } finally {
            // Clear local state
            set({ user: null, token: null });
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            delete axiosInstance.defaults.headers.common["Authorization"];
        }
    },

    // ✅ New: Logout from all devices
    logoutAll: async () => {
        try {
            await axiosInstance.post("/logout-all");
        } catch (error) {
            console.error("Logout all error:", error);
        } finally {
            set({ user: null, token: null });
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            delete axiosInstance.defaults.headers.common["Authorization"];
        }
    },
}));

export default useAuthStore;