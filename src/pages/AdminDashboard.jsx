import { useEffect, useState } from "react"
import API from "../api"
import NotificationBell from "../components/NotificationBell"
import { motion } from "framer-motion"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"

export default function AdminDashboard() {

    const [faculty, setFaculty] = useState([])
    const [pending, setPending] = useState([])
    const [tasks, setTasks] = useState([])
    const [search, setSearch] = useState("")
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        fetchFaculty()
        fetchPending()
        fetchTasks()
        fetchNotifications()
    }, [])

    const fetchFaculty = async () => {
        try {
            const res = await API.get("/api/admin/faculty")
            setFaculty(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchPending = async () => {
        try {
            const res = await API.get("/api/admin/pending")
            setPending(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchTasks = async () => {
        try {
            const res = await API.get("/api/tasks")
            setTasks(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const approveFaculty = async (id) => {
        try {
            await API.post(`/api/admin/approve/${id}`)
            fetchPending()
            fetchFaculty()
        } catch (err) {
            console.error(err)
        }
    }

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/api/admin/notifications")
            setNotifications(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const markNotificationsRead = async (id) => {
        try {
            await API.put(`/api/admin/notifications/read/${id}`, {})
            fetchNotifications()
        } catch (err) {
            console.error("Notification read error:", err)
        }
    }

    const stats = [
        { name: "Faculty", value: faculty.length },
        { name: "Tasks", value: tasks.length },
        { name: "Completed", value: tasks.filter(t => t.status === "completed").length }
    ]

    const taskPie = [
        { name: "Completed", value: tasks.filter(t => t.status === "completed").length },
        { name: "Pending", value: tasks.filter(t => t.status !== "completed").length }
    ]

    const filteredFaculty = faculty.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    )

    const colors = ["#6366f1", "#10b981"]

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* Sidebar */}
            <motion.div
                initial={{ x: -200 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-64 bg-white shadow-2xl p-6"
            >
                <h1 className="text-2xl font-bold text-indigo-600 mb-10">
                    Admin Panel
                </h1>

                <div className="space-y-5 text-gray-600 text-lg">
                    <div className="hover:text-indigo-600 cursor-pointer font-medium">
                        Dashboard
                    </div>
                    <div className="hover:text-indigo-600 cursor-pointer font-medium">
                        Faculty
                    </div>
                    <div className="hover:text-indigo-600 cursor-pointer font-medium">
                        Tasks
                    </div>
                </div>
            </motion.div>

            {/* Main */}
            <div className="flex-1">

                {/* Navbar */}
                <div className="flex justify-between items-center bg-white shadow px-10 py-4">
                    <h1 className="text-xl font-semibold text-gray-700">
                        Admin Dashboard
                    </h1>

                    <div className="flex items-center gap-6">
                        <NotificationBell
                            notifications={notifications}
                            markRead={markNotificationsRead}
                        />

                        <button
                            onClick={() => {
                                localStorage.removeItem("token")
                                localStorage.removeItem("user")
                                window.location.href = "/login"
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Page */}
                <div className="p-10">

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mb-10">
                        {stats.map((s, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className="bg-white rounded-xl p-6 shadow-lg border"
                            >
                                <h2 className="text-gray-500 text-sm uppercase">
                                    {s.name}
                                </h2>
                                <p className="text-4xl font-bold text-indigo-600 mt-2">
                                    {s.value}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-2 gap-8 mb-10">

                        {/* Bar Chart */}
                        <div className="bg-white p-6 rounded-xl shadow">
                            <h2 className="text-xl font-semibold mb-4">
                                System Statistics
                            </h2>

                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#6366f1" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white p-6 rounded-xl shadow">
                            <h2 className="text-xl font-semibold mb-4">
                                Task Completion
                            </h2>

                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={taskPie}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={100}
                                        label
                                    >
                                        {taskPie.map((entry, index) => (
                                            <Cell key={index} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pending Faculty */}
                    <div className="bg-white p-6 rounded-xl shadow mb-10">
                        <h2 className="text-xl font-semibold mb-4">
                            Pending Faculty Approvals
                        </h2>

                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="py-3">Name</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pending.map(user => (
                                    <motion.tr
                                        key={user.id}
                                        whileHover={{ backgroundColor: "#f9fafb" }}
                                        className="border-b"
                                    >
                                        <td className="py-3">{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <button
                                                onClick={() => approveFaculty(user.id)}
                                                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition"
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Faculty */}
                    <div className="bg-white p-6 rounded-xl shadow mb-10">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-semibold">
                                All Faculty
                            </h2>

                            <input
                                type="text"
                                placeholder="Search faculty..."
                                className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="py-3">Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredFaculty.map(f => (
                                    <motion.tr
                                        key={f.id}
                                        whileHover={{ backgroundColor: "#f9fafb" }}
                                        className="border-b"
                                    >
                                        <td className="py-3">{f.name}</td>
                                        <td>{f.email}</td>
                                        <td>
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                Approved
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tasks */}
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            Submitted Tasks
                        </h2>

                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="py-3">Title</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tasks.map(t => (
                                    <motion.tr
                                        key={t.id}
                                        whileHover={{ backgroundColor: "#f9fafb" }}
                                        className="border-b"
                                    >
                                        <td className="py-3">{t.title}</td>
                                        <td>
                                            <span className={
                                                t.status === "completed"
                                                    ? "text-green-600 font-medium"
                                                    : "text-yellow-600 font-medium"
                                            }>
                                                {t.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    )
}