import { useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function SuperAdminDashboard() {

    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");

    const [rejectId, setRejectId] = useState(null);
    const [reason, setReason] = useState("");

    // ================= FETCH =================
    const fetchRequests = async () => {
        const res = await API.get("/api/admin-request/admin-requests");
        setRequests(res.data || []);
        setFiltered(res.data || []);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // ================= SEARCH =================
    useEffect(() => {
        const data = requests.filter(r =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.email.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(data);
    }, [search, requests]);

    // ================= ACTIONS =================
    const approve = async (id) => {
        await API.post(`/api/admin-request/approve-admin/${id}`);
        toast.success("Approved ✅");
        fetchRequests();
    };

    const reject = async () => {
        await API.post(`/api/admin-request/reject-admin/${rejectId}`, { reason });
        toast.success("Rejected ❌");
        setRejectId(null);
        setReason("");
        fetchRequests();
    };

    // ================= LOGOUT =================
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logged out 👋");
        navigate("/login");
    };

    // ================= CHART DATA =================
    const chartData = Object.values(
        requests.reduce((acc, r) => {
            const date = new Date(r.created_at).toLocaleDateString();
            acc[date] = acc[date] || { date, count: 0 };
            acc[date].count++;
            return acc;
        }, {})
    );

    // ================= STATS =================
    const total = requests.length;
    const pending = requests.filter(r => r.status === "pending").length;
    const approved = requests.filter(r => r.status === "approved").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 p-8">

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-8">

                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Super Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage admin approvals & organizations 🚀
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-white/70 backdrop-blur-md border px-5 py-2 rounded-xl shadow hover:scale-105 transition"
                >
                    🚪 Logout
                </button>

            </div>

            {/* ================= STATS ================= */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">

                <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
                    <p className="text-gray-500 text-sm">Total Requests</p>
                    <h2 className="text-3xl font-bold text-blue-600">{total}</h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
                    <p className="text-gray-500 text-sm">Pending</p>
                    <h2 className="text-3xl font-bold text-yellow-600">{pending}</h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
                    <p className="text-gray-500 text-sm">Approved</p>
                    <h2 className="text-3xl font-bold text-green-600">{approved}</h2>
                </div>

            </div>

            {/* ================= SEARCH ================= */}
            <input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-1/3 px-4 py-3 mb-8 rounded-xl border shadow-sm focus:ring-2 focus:ring-blue-400"
            />

            {/* ================= CHART ================= */}
            <div className="bg-white p-6 rounded-2xl shadow mb-10">
                <h2 className="font-semibold mb-4">Request Trends</h2>

                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* ================= REQUEST CARDS ================= */}
            <div className="grid md:grid-cols-2 gap-6">

                {filtered.map((req, index) => (
                    <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white p-6 rounded-2xl shadow hover:shadow-2xl transition border"
                    >

                        <div className="flex justify-between">
                            <div>
                                <h2 className="font-bold text-lg">{req.name}</h2>
                                <p className="text-sm text-gray-500">{req.email}</p>
                            </div>

                            <span className={`text-xs px-3 py-1 rounded-full 
                                ${req.status === "approved" ? "bg-green-100 text-green-700" :
                                    req.status === "rejected" ? "bg-red-100 text-red-700" :
                                        "bg-yellow-100 text-yellow-700"}`}>
                                {req.status}
                            </span>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                            <p><b>Organization:</b> {req.organization_name || "Existing"}</p>
                            <p><b>Department:</b> {req.department}</p>
                        </div>

                        {req.status === "pending" && (
                            <div className="flex gap-3 mt-5">

                                <button
                                    onClick={() => approve(req.id)}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg hover:scale-105 transition"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => setRejectId(req.id)}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 rounded-lg hover:scale-105 transition"
                                >
                                    Reject
                                </button>

                            </div>
                        )}

                    </motion.div>
                ))}

            </div>

            {/* ================= MODAL ================= */}
            {rejectId && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-6 rounded-2xl w-96 shadow-2xl"
                    >
                        <h2 className="text-lg font-bold mb-3">Reject Reason</h2>

                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason..."
                            className="w-full border p-3 rounded-lg mb-4 focus:ring-2 focus:ring-red-400"
                        />

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() => setRejectId(null)}
                                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={reject}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                            >
                                Submit
                            </button>

                        </div>

                    </motion.div>

                </div>
            )}

        </div>
    );
}