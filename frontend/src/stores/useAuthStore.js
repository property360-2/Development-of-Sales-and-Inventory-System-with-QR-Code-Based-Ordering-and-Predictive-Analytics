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
        const role = localStorage.getItem("userRole");
        console.log("Found:", { token, role });

        if (token && role) {
            // set axios header immediately
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            set({
                token,
                user: { role },
                loading: false,
            });
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
            localStorage.setItem("userRole", user.role);

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
