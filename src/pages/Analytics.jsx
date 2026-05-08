import { useEffect, useState } from "react";
import API from "../api";
import AppShell from "../components/AppShell";
import { motion } from "framer-motion";
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

export default function Analytics() {
    const [myStats, setMyStats] = useState({});
    const [assignedStats, setAssignedStats] = useState({});
    const [myTasks, setMyTasks] = useState([]); // ✅ NEW
    const [tab, setTab] = useState("me");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res1 = await API.get("/api/tasks/productivity");
            const res2 = await API.get("/api/tasks/assigned-analytics");
            const res3 = await API.get("/api/tasks/mytasks"); // ✅ NEW

            setMyStats(res1.data || {});
            setAssignedStats(res2.data || {});
            setMyTasks(res3.data || []); // ✅ NEW
        } catch (err) {
            console.error(err);
        }
    };

    /* ------------------ DATA ------------------ */

    const pieData = [
        { name: "Completed", value: myStats.completed_tasks || 0 },
        { name: "Pending", value: myStats.pending_tasks || 0 },
        { name: "Overdue", value: myStats.overdue_tasks || 0 },
    ];

    const barData = [
        { name: "Completed", value: assignedStats.completed?.length || 0 },
        { name: "Pending", value: assignedStats.pending?.length || 0 },
        { name: "Overdue", value: assignedStats.overdue?.length || 0 },
    ];

    const completionRate = myStats.completion_rate || 0;

    const insight =
        assignedStats.overdue?.length > 3
            ? "⚠️ Too many overdue tasks. Follow up required."
            : completionRate > 70
                ? "🔥 Great performance this week!"
                : "📈 Try improving completion rate.";

    const topPerformer =
        assignedStats.completed?.length > 0
            ? assignedStats.completed[0]
            : "No data";

    return (
        <AppShell userName="Faculty" userRole="Faculty Member">
            <h1 className="text-3xl font-bold mb-6">📊 Analytics</h1>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
                {["me", "assigned"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-xl transition ${tab === t
                            ? "bg-[color:var(--brand)] text-white shadow-lg"
                            : "bg-white/40 backdrop-blur text-gray-600"
                            }`}
                    >
                        {t === "me" ? "My Work" : "Delegation"}
                    </button>
                ))}
            </div>

            {/* ================= MY WORK ================= */}
            {tab === "me" && (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard title="Total" value={myStats.total_tasks} />
                        <StatCard title="Completed" value={myStats.completed_tasks} color="text-green-500" />
                        <StatCard title="Pending" value={myStats.pending_tasks} color="text-yellow-500" />
                        <StatCard title="Overdue" value={myStats.overdue_tasks} color="text-red-500" />
                    </div>

                    {/* Pie Chart */}
                    <GlassCard>
                        <h2 className="mb-4 font-semibold">Task Distribution</h2>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    outerRadius={90}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Completion + Insight */}
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <GlassCard>
                            <h2 className="font-semibold">Completion Rate</h2>
                            <p className="text-3xl font-bold text-[color:var(--brand)] mt-2">
                                {completionRate}%
                            </p>
                        </GlassCard>

                        <GlassCard>
                            <h2 className="font-semibold">Insight</h2>
                            <p className="mt-2 text-sm">{insight}</p>
                        </GlassCard>
                    </div>

                    {/* 🔥 MY TASK TABLE */}
                    <GlassCard>
                        <h2 className="mb-4 font-semibold">My Tasks</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="text-left px-4 py-3">Task</th>
                                        <th className="text-left px-4 py-3">Due Date</th>
                                        <th className="text-left px-4 py-3">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {myTasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-6 text-gray-400">
                                                No tasks assigned
                                            </td>
                                        </tr>
                                    ) : (
                                        myTasks.map((t, i) => {
                                            const due = new Date(t.tasks?.due_date);
                                            const now = new Date();

                                            let status = "Pending";

                                            if (t.status === "completed") {
                                                status = "Completed";
                                            } else if (due < now) {
                                                status = "Overdue";
                                            }

                                            return (
                                                <tr key={i} className="border-t hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3 font-medium">
                                                        {t.tasks?.title}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {t.tasks?.due_date
                                                            ? new Date(t.tasks.due_date).toLocaleDateString()
                                                            : "-"}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                            ${status === "Completed" && "bg-green-100 text-green-600"}
                                                            ${status === "Pending" && "bg-yellow-100 text-yellow-600"}
                                                            ${status === "Overdue" && "bg-red-100 text-red-600"}
                                                        `}>
                                                            {status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </>
            )}

            {/* ================= DELEGATION ================= */}
            {tab === "assigned" && (
                <>
                    {/* Bar Chart */}
                    <GlassCard>
                        <h2 className="mb-4 font-semibold">Team Performance</h2>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={barData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#facc15" />
                                    <Cell fill="#ef4444" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Top Performer */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg"
                    >
                        🏆 Top Performer: <span className="font-bold">{topPerformer}</span>
                    </motion.div>

                    {/* Task-wise Table */}
                    <GlassCard>
                        <h2 className="mb-4 font-semibold">Task-wise Analytics</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Task</th>
                                        <th className="px-4 py-3 text-left">Due Date</th>
                                        <th className="px-4 py-3 text-left">Pending</th>
                                        <th className="px-4 py-3 text-left">Completed</th>
                                        <th className="px-4 py-3 text-left">Overdue</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(assignedStats.tasks || []).map((t, i) => (
                                        <tr key={i} className="border-t align-top">
                                            <td className="px-4 py-4 font-medium">{t.task_title}</td>
                                            <td className="px-4 py-4">
                                                {new Date(t.due_date).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 py-4">
                                                {t.pending.map((n, idx) => (
                                                    <div key={idx} className="text-xs bg-yellow-100 p-1 rounded mb-1">{n}</div>
                                                ))}
                                            </td>

                                            <td className="px-4 py-4">
                                                {t.completed.map((n, idx) => (
                                                    <div key={idx} className="text-xs bg-green-100 p-1 rounded mb-1">{n}</div>
                                                ))}
                                            </td>

                                            <td className="px-4 py-4">
                                                {t.overdue.map((n, idx) => (
                                                    <div key={idx} className="text-xs bg-red-100 p-1 rounded mb-1">{n}</div>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </>
            )}
        </AppShell>
    );
}

/* COMPONENTS */

function StatCard({ title, value, color = "text-blue-600" }) {
    return (
        <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl shadow p-4">
            <p className="text-xs text-gray-400 uppercase">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value || 0}</p>
        </motion.div>
    );
}

function GlassCard({ children }) {
    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow p-5">
            {children}
        </div>
    );
}