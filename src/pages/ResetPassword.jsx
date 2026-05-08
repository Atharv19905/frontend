import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function ResetPassword() {

    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await API.post(`/api/auth/reset-password/${token}`, {
                password
            });

            toast.success(res.data.message);

            navigate("/login");

        } catch (err) {
            toast.error(err?.response?.data?.message || "Error ❌");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">
                    Reset Password
                </h2>

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border px-4 py-2 rounded-lg mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Reset Password"}
                </button>
            </motion.form>

        </div>
    );
}