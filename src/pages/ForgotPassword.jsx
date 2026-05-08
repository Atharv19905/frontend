import { useState } from "react";
import API from "../api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await API.post("/api/auth/forgot-password", { email });

            toast.success(res.data.message);

        } catch (err) {
            toast.error(err?.response?.data?.message || "Error ❌");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">
                    Forgot Password
                </h2>

                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border px-4 py-2 rounded-lg mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    className="w-full bg-blue-600 text-white py-2 rounded-lg"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </motion.form>

        </div>
    );
}