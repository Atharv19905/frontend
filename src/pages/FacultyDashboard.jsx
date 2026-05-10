import { useEffect, useState } from "react";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AppShell from "../components/AppShell";
import PanelHeader from "../components/PanelHeader";
import KanbanColumn from "../components/KanbanColumn";
import { HiOutlineDownload } from "react-icons/hi";
import toast from "react-hot-toast";

const BASE = "/api/tasks";

export default function FacultyDashboard() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({});
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);

    // Modal
    const [openAssign, setOpenAssign] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [visibility, setVisibility] = useState("private");
    const [dueDate, setDueDate] = useState("");
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedFaculties, setSelectedFaculties] = useState([]);
    const [file, setFile] = useState(null);

    /* ✅ Load tasks */
    const loadTasks = async () => {
        try {
            const r = await API.get(`${BASE}/mytasks`);
            setTasks(r.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!token) return;
        Promise.allSettled([
            loadTasks(),
            API.get(`${BASE}/productivity`).then((r) => setStats(r.data || {})),
            API.get(`${BASE}/departments`).then((r) => setDepartments(r.data || [])),
        ]);
        // eslint-disable-next-line
    }, []);

    const loadFaculties = async (deptArray = []) => {
        let url = `${BASE}/faculties`;
        if (deptArray.length) url += `?department_id=${deptArray.join(",")}`;
        try {
            const res = await API.get(url);
            setFaculties(res.data || []);
        } catch { }
    };

    const completeTask = async (id) => {
        try {
            await API.put(`${BASE}/complete/${id}`, {});
            await loadTasks();
        } catch { }
    };

 const createAndAssign = async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("priority", priority);
        formData.append("due_date", dueDate);
        formData.append("visibility", visibility);

        if (file) formData.append("document", file);

        const taskRes = await API.post(`${BASE}/create`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (selectedFaculties.length === 0) {
            toast.error("Select at least one faculty");
            return;
        }

        await Promise.all(
            selectedFaculties.map((f) =>
                API.post(`${BASE}/assign`, {
                    task_id: taskRes.data.id,
                    faculty_id: f,
                })
            )
        );

        // ✅ FIRST: update UI (no delay)
        await loadTasks();

        // ✅ SECOND: show toast
        toast.success("Task assigned successfully 🚀");

        // ✅ THIRD: reset form
        setTitle("");
        setDescription("");
        setDueDate("");
        setFile(null);
        setSelectedFaculties([]);
        setSelectedDepartments([]);

        // ✅ LAST: close modal (small delay only here)
        setTimeout(() => setOpenAssign(false), 300);

    } catch (err) {
        console.error(err);
        toast.error("Assignment failed ❌");
    }
};

    const downloadReport = async () => {
        try {
            const res = await API.get(`${BASE}/report`);
            const doc = new jsPDF();
            doc.text("Faculty Task Report", 14, 20);

            const rows = (res.data || []).map((t) => [
                t.tasks?.title || "",
                t.status || "",
                t.tasks?.priority || "",
                t.tasks?.due_date
                    ? new Date(t.tasks.due_date).toLocaleDateString()
                    : "",
            ]);

            autoTable(doc, {
                startY: 30,
                head: [["Title", "Status", "Priority", "Due Date"]],
                body: rows,
            });

            doc.save("report.pdf");
        } catch { }
    };

    const now = new Date();

    const columns = {
        inProgress: tasks.filter(t =>
            t.status === "pending" &&
            new Date(t.tasks?.due_date) >= now
        ),
        overdue: tasks.filter(t =>
            t.status !== "completed" &&
            t.tasks?.due_date &&
            new Date(t.tasks.due_date) < now
        ),
        completed: tasks.filter(t =>
            t.status === "completed"
        )
    };

    const userName = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}")?.name || "Faculty";
        } catch {
            return "Faculty";
        }
    })();

    return (
        <AppShell userName={userName} userRole="Faculty Member">
            <PanelHeader
                title="Dashboard"
                emoji="🗂️"
                onAdd={() => setOpenAssign(true)}
                onShare={downloadReport}
                right={
                    <button
                        onClick={downloadReport}
                        className="hidden md:inline-flex h-10 px-4 rounded-full bg-[color:var(--surface-muted)] text-sm font-medium text-[color:var(--ink-muted)] items-center gap-2"
                    >
                        <HiOutlineDownload /> Report
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    ["Total", stats.total_tasks, "text-[color:var(--brand)]"],
                    ["Completed", stats.completed_tasks, "text-emerald-600"],
                    ["Pending", stats.pending_tasks, "text-amber-600"],
                    ["Overdue", stats.overdue_tasks, "text-rose-600"],
                ].map(([label, value, cls]) => (
                    <motion.div key={label} className="bg-white rounded-2xl p-4 border shadow-card">
                        <p className="text-xs uppercase">{label}</p>
                        <p className={`text-2xl font-bold ${cls}`}>{value || 0}</p>
                    </motion.div>
                ))}
            </div>

            {/* Kanban */}
            <div className="flex flex-col md:flex-row gap-4">
                <KanbanColumn
                    label="In Progress"
                    variant="progress"
                    tasks={columns.inProgress}
                    onAdd={() => setOpenAssign(true)}
                    refresh={loadTasks}
                />
                <KanbanColumn
                    label="Overdue"
                    variant="overdue"
                    tasks={columns.overdue}
                    refresh={loadTasks}
                />
                <KanbanColumn
                    label="Completed"
                    variant="done"
                    tasks={columns.completed}
                    onCardClick={(t) => completeTask(t.id)}
                />
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {openAssign && (
                    <motion.div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
                        <motion.div className="bg-white rounded-3xl w-full max-w-2xl">

                            <div className="p-6 flex justify-between">
                                <h2>Create & Assign Task</h2>
                                <button onClick={() => setOpenAssign(false)}>✕</button>
                            </div>

                            <form onSubmit={createAndAssign} className="p-6 grid grid-cols-2 gap-4">

                                <input
                                    className="col-span-2 border p-3 rounded"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />

                                <textarea
                                    className="col-span-2 border p-3 rounded"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />

                                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />

                                <select
                                    className="col-span-2"
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                >
                                    <option value="private">Private</option>
                                    <option value="department">Department</option>
                                    <option value="public">Public</option>
                                </select>

                                <input
                                    type="file"
                                    className="col-span-2"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />

                                {visibility !== "private" && (
                                    <div className="col-span-2">
                                        <Select
                                            isMulti
                                            placeholder="Select Departments"
                                            options={[
                                                { value: "all", label: "Select All Departments" },   // ✅ added
                                                ...departments.map((d) => ({
                                                    value: d.id,
                                                    label: d.name,
                                                })),
                                            ]}
                                            onChange={(sel) => {
                                                const values = (sel || []).map((s) => s.value);

                                                if (values.includes("all")) {
                                                    const allIds = departments.map((d) => d.id);
                                                    setSelectedDepartments(allIds);
                                                    loadFaculties(allIds); // load all faculties
                                                } else {
                                                    setSelectedDepartments(values);
                                                    loadFaculties(values);
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="col-span-2">
                                    <Select
                                        isMulti
                                        placeholder="Assign Faculties"
                                        options={[
                                            { value: "all", label: "Select All Faculties" },  // ✅ added
                                            ...faculties.map((f) => ({
                                                value: f.id,
                                                label: f.name,
                                            })),
                                        ]}
                                        onChange={(sel) => {
                                            const values = (sel || []).map((s) => s.value);

                                            if (values.includes("all")) {
                                                setSelectedFaculties(faculties.map((f) => f.id));
                                            } else {
                                                setSelectedFaculties(values);
                                            }
                                        }}
                                    />
                                </div>

                                <button className="col-span-2 bg-blue-600 text-white py-2 rounded">
                                    Create & Assign
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppShell>
    );
}
