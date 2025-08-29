import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    loading: true,
    error: null,

    initialize: async () => {
        // optionally check session here, e.g., via /auth/me
        set({ loading: false });
    },

    login: async (credentials) => {
        try {
            const res = await axiosInstance.post("/login", credentials);
            const { token, user } = res.data;

            // Save token & user in store
            set({ token, user, error: null });

            // Store token in localStorage/sessionStorage for persistence
            localStorage.setItem("authToken", token);
            localStorage.setItem("userRole", user.role);

            // Set token in axios default header
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return user;
        } catch (err) {
            set({ error: "Invalid credentials" });
            throw err;
        }
    },

    logout: async () => {
        set({ user: null, token: null });
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        delete axiosInstance.defaults.headers.common["Authorization"];
    },
}));

export default useAuthStore;
