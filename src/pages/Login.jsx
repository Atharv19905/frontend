import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import { toast } from "react-hot-toast";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await API.post("/api/auth/login", {
                email,
                password
            });

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);

            toast.success("Login successful 🎉");

            if (data.user.role === "super_admin") {
                navigate("/super-admin");
            } else if (data.user.role === "admin") {
                navigate("/admin-dashboard");
            } else if (data.user.role === "faculty") {
                navigate("/faculty-dashboard");
            }
            else {
                navigate("/");
            }

        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed ❌");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

            {/* LEFT PANEL */}
            <div
                className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
                style={{
                    background:
                        "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.46 0.24 290))",
                }}
            >
                <div className="absolute -top-24 -left-12 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-400/20 blur-3xl animate-pulse" />

                <div className="relative flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white text-[color:var(--brand)] grid place-items-center font-bold">
                        F
                    </div>
                    <span className="font-bold text-lg">FacultyFlow</span>
                </div>

                <div className="relative">
                    <h2 className="text-4xl font-bold leading-tight">
                        Welcome back.<br />Let's move tasks forward.
                    </h2>
                    <p className="mt-4 text-white/80 max-w-md">
                        Sign in to continue managing your department's Kanban board.
                    </p>
                </div>

                <p className="relative text-xs text-white/60">
                    © 2026 FacultyFlow
                </p>
            </div>

            {/* RIGHT FORM */}
            <div className="flex items-center justify-center p-6 bg-white">
                <motion.form
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleLogin}
                    className="w-full max-w-md"
                >
                    <h1 className="text-3xl font-bold tracking-tight">
                        Sign in
                    </h1>
                    <p className="text-sm text-[color:var(--ink-muted)] mt-1 mb-8">
                        to your FacultyFlow account
                    </p>

                    {/* Email */}
                    <label className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[color:var(--border)] outline-none focus:border-[color:var(--brand)] mb-4"
                    />

                    {/* Password */}
                    <label className="block text-sm font-medium mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[color:var(--border)] outline-none focus:border-[color:var(--brand)] mb-2"
                    />

                    {/* ✅ Forgot Password */}
                    <div className="text-right mb-4">
                        <button
                            type="button"
                            onClick={() => {
                                toast("Redirecting to reset password...");
                                navigate("/forgot-password");
                            }}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-[color:var(--brand)] text-white py-3 rounded-xl font-semibold hover:bg-[color:var(--brand-deep)] transition disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="mt-6 text-sm text-[color:var(--ink-muted)] text-center">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-[color:var(--brand)] font-semibold"
                        >
                            Sign up
                        </Link>
                    </p>
                </motion.form>
            </div>
        </div>
    );
}