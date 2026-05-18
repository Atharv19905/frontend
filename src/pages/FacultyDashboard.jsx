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

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({});
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);

    // ✅ Search
    const [searchQuery, setSearchQuery] = useState("");

    // Modal
    const [openAssign, setOpenAssign] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignmentNote, setAssignmentNote] = useState("");
    const [priority, setPriority] = useState("medium");
    const [visibility, setVisibility] = useState("private");
    const [dueDate, setDueDate] = useState("");
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedFaculties, setSelectedFaculties] = useState([]);
    const [selectedFacultyOptions, setSelectedFacultyOptions] = useState([]);
    const [file, setFile] = useState(null);

    const [tutorialSeen, setTutorialSeen] = useState(
    typeof window !== "undefined" &&
    localStorage.getItem("tutorialSeen")
);

    /* ✅ Load tasks */
    const loadTasks = async () => {

        try {

            const r = await API.get(`${BASE}/mytasks`);

            setTasks([...(r.data || [])]);

        } catch (err) {

            console.error(err);
        }
    };

    useEffect(() => {

        if (!token) return;

        Promise.allSettled([
            loadTasks(),

            API.get(`${BASE}/productivity`)
                .then((r) => setStats(r.data || {})),

            API.get(`${BASE}/departments`)
                .then((r) => setDepartments(r.data || [])),
        ]);

        // eslint-disable-next-line
    }, []);

    const loadFaculties = async (deptArray = []) => {

        let url = `${BASE}/faculties`;

        if (deptArray.length) {
            url += `?department_id=${deptArray.join(",")}`;
        }

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

            formData.append("note", assignmentNote);

            const extractedTags =
                assignmentNote.match(/#\w+/g) || [];

            formData.append(
                "tags",
                extractedTags.join(",")
            );

            formData.append("priority", priority);

            formData.append("due_date", dueDate);

            formData.append("visibility", visibility);

            if (file) {
                formData.append("document", file);
            }

            const taskRes = await API.post(
                `${BASE}/create`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            await Promise.allSettled(
                selectedFaculties.map((f) =>
                    API.post(`${BASE}/assign`, {
                        task_id: taskRes.data.id,
                        faculty_id: f,
                    })
                )
            );

            toast.success(
                "Task assigned successfully 🚀"
            );

            await loadTasks();

            setOpenAssign(false);

            setTitle("");
            setDescription("");
            setAssignmentNote("");
            setDueDate("");
            setFile(null);
            setSelectedFaculties([]);
            setSelectedFacultyOptions([]);
            setSelectedDepartments([]);

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
                    ? new Date(
                        t.tasks.due_date
                    ).toLocaleDateString()
                    : "",
            ]);

            autoTable(doc, {
                startY: 30,
                head: [
                    [
                        "Title",
                        "Status",
                        "Priority",
                        "Due Date",
                    ],
                ],
                body: rows,
            });

            doc.save("report.pdf");

        } catch { }
    };

   const createDemoTasks = async () => {

    try {

        const demoTasks = [
            {
                title: "Prepare Placement Report",

                description:
                    "Collect placement data for final year students",

                note:
                    "Important for TPO meeting #placement #report",

                priority: "high",

                visibility: "private",

                due_date: "2026-05-25",
            },

            {
                title: "Upload Exam Schedule",

                description:
                    "Publish semester examination timetable",

                note:
                    "Need approval from HOD #exam",

                priority: "medium",

                visibility: "private",

                due_date: "2026-05-20",
            },

            {
                title: "Research Paper Draft",

                description:
                    "Complete AI research paper",

                note:
                    "Personal academic work #research #personal",

                priority: "low",

                visibility: "private",

                due_date: "2026-05-28",
            },
        ];

        for (const task of demoTasks) {

            const formData = new FormData();

            formData.append(
                "title",
                task.title
            );

            formData.append(
                "description",
                task.description
            );

            formData.append(
                "note",
                task.note
            );

            const extractedTags =
                task.note.match(/#\w+/g) || [];

            formData.append(
                "tags",
                extractedTags.join(",")
            );

            formData.append(
                "priority",
                task.priority
            );

            formData.append(
                "visibility",
                task.visibility
            );

            formData.append(
                "due_date",
                task.due_date
            );

            const taskRes = await API.post(
                `${BASE}/create`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            if (currentUser?.id) {

                await API.post(
                    `${BASE}/assign`,
                    {
                        task_id: taskRes.data.id,

                        faculty_id: currentUser.id,
                    }
                );
            }
        }

        toast.success(
            "Demo tasks added 🚀"
        );

        localStorage.setItem(
            "tutorialSeen",
            "true"
        );

        setTutorialSeen(true);

        await loadTasks();

    } catch (err) {

        console.error(err);

        toast.error(
            "Failed to add demo tasks"
        );
    }
};
    /* ✅ FILTER TASKS */
    const filteredTasks = tasks.filter((t) => {

        const title =
            t.tasks?.title?.toLowerCase() || "";

        const description =
            t.tasks?.description?.toLowerCase() || "";

        const note =
            t.tasks?.note?.toLowerCase() || "";

        const tags = Array.isArray(t.tasks?.tags)
            ? t.tasks.tags
            : String(t.tasks?.tags || "")
                .split(",");

        const visibility =
            t.tasks?.visibility?.toLowerCase() || "";

        const query =
            searchQuery.toLowerCase().trim();

        if (!query) return true;

        // TAG SEARCH
        if (query.startsWith("#")) {

            const tag =
                query.replace("#", "");

            if (tag === "personal") {
                return visibility === "private";
            }

            if (tag === "department") {
                return visibility === "department";
            }

            if (tag === "public") {
                return visibility === "public";
            }

            return (
                title.includes(tag) ||
                description.includes(tag) ||
                note.includes(tag) ||
                tags.some(
                    (t) =>
                        t.toLowerCase() ===
                        `#${tag}`
                )
            );
        }

        // NORMAL SEARCH
        return (
            title.includes(query) ||
            description.includes(query) ||
            note.includes(query)
        );
    });

    const now = new Date();

    const columns = {

        inProgress: filteredTasks.filter(
            (t) =>
                t.status === "pending" &&
                new Date(
                    t.tasks?.due_date
                ) >= now
        ),

        overdue: filteredTasks.filter(
            (t) =>
                t.status !== "completed" &&
                t.tasks?.due_date &&
                new Date(
                    t.tasks.due_date
                ) < now
        ),

        completed: filteredTasks.filter(
            (t) =>
                t.status === "completed"
        ),
    };

    const userName = (() => {

        try {

            return (
                JSON.parse(
                    localStorage.getItem("user") || "{}"
                )?.name || "Faculty"
            );

        } catch {

            return "Faculty";
        }
    })();

    const currentUser = (() => {

        try {

            return JSON.parse(
                localStorage.getItem("user") || "{}"
            );

        } catch {

            return {};
        }
    })();

    useEffect(() => {

        if (
            visibility === "private" &&
            currentUser?.id
        ) {

            setSelectedFaculties([
                currentUser.id,
            ]);

            setSelectedFacultyOptions([
                {
                    value: currentUser.id,
                    label: currentUser.name,
                },
            ]);
        }

    }, [visibility]);

    return (

        <AppShell
            userName={userName}
            userRole="Faculty Member"
        >

            <PanelHeader
                title="Dashboard"
                emoji="🗂️"
                onAdd={() => setOpenAssign(true)}
                onShare={downloadReport}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                right={
    <div className="flex items-center gap-3">

        {/* Tutorial Button */}
        <button
            onClick={() => {

                localStorage.removeItem(
                    "tutorialSeen"
                );

                setTutorialSeen(false);
            }}
            className="
                hidden md:flex
                items-center
                gap-2
                h-11
                px-5
                rounded-2xl
                bg-gradient-to-r
                from-indigo-600
                to-violet-600
                text-white
                font-semibold
                shadow-lg
                hover:scale-105
                hover:shadow-xl
                transition-all
                duration-300
            "
        >
            ✨ Tutorial
        </button>

        {/* Report Button */}
        <button
            onClick={downloadReport}
            className="
                hidden md:flex
                items-center
                gap-2
                h-11
                px-5
                rounded-2xl
                bg-white
                border
                border-gray-200
                text-gray-700
                font-semibold
                shadow-sm
                hover:shadow-md
                hover:border-gray-300
                transition-all
                duration-300
            "
        >
            <HiOutlineDownload className="text-lg" />
            Report
        </button>

    </div>
}
            />

            {/* Stats */}
            <div className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-3
                mb-6
            ">

                {[
                    [
                        "Total",
                        stats.total_tasks,
                        "text-[color:var(--brand)]",
                    ],

                    [
                        "Completed",
                        stats.completed_tasks,
                        "text-emerald-600",
                    ],

                    [
                        "Pending",
                        stats.pending_tasks,
                        "text-amber-600",
                    ],

                    [
                        "Overdue",
                        stats.overdue_tasks,
                        "text-rose-600",
                    ],
                ].map(([label, value, cls]) => (

                    <motion.div
                        key={label}
                        className="
                            bg-white
                            rounded-2xl
                            p-4
                            border
                            shadow-card
                        "
                    >

                        <p className="text-xs uppercase">
                            {label}
                        </p>

                        <p className={`
                            text-2xl
                            font-bold
                            ${cls}
                        `}>
                            {value || 0}
                        </p>

                    </motion.div>
                ))}
            </div>

            {/* Tutorial Empty State */}
            {/* Tutorial Section */}
{!tutorialSeen && (

    <motion.div
        initial={{
            opacity: 0,
            y: 30,
        }}

        animate={{
            opacity: 1,
            y: 0,
        }}

        transition={{
            duration: 0.5,
        }}

        className="
            relative
            overflow-hidden
            rounded-[32px]
            mb-8
            border
            border-white/40
            bg-gradient-to-br
            from-slate-900
            via-indigo-950
            to-slate-900
            shadow-2xl
        "
    >

        {/* Glow Effects */}
        <div className="
            absolute
            top-0
            left-0
            w-72
            h-72
            bg-indigo-500/20
            rounded-full
            blur-3xl
        " />

        <div className="
            absolute
            bottom-0
            right-0
            w-72
            h-72
            bg-violet-500/20
            rounded-full
            blur-3xl
        " />

        <div className="
            relative
            z-10
            p-8
            md:p-12
        ">

            {/* Top Row */}
            <div className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-6
                mb-10
            ">

                <div>

                    <div className="
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        rounded-full
                        bg-white/10
                        border
                        border-white/10
                        text-indigo-200
                        text-sm
                        font-medium
                        backdrop-blur
                        mb-5
                    ">
                        🚀 Smart Academic Workflow System
                    </div>

                    <h2 className="
                        text-4xl
                        md:text-5xl
                        font-black
                        leading-tight
                        text-white
                        mb-4
                    ">
                        Task
                        <span className="
                            bg-gradient-to-r
                            from-indigo-300
                            to-violet-300
                            bg-clip-text
                            text-transparent
                        ">
                            {" "}Nexus
                        </span>
                    </h2>

                    <p className="
                        text-slate-300
                        text-lg
                        max-w-3xl
                        leading-relaxed
                    ">
                        Streamline academic operations,
                        assign faculty work instantly,
                        track deadlines visually and
                        manage departmental productivity
                        with an enterprise-grade workflow dashboard.
                    </p>

                </div>

                {/* Dismiss */}
                <button
                    onClick={() => {

                        localStorage.setItem(
                            "tutorialSeen",
                            "true"
                        );

                        setTutorialSeen(true);
                    }}

                    className="
                        self-start
                        px-4
                        py-2
                        rounded-xl
                        bg-white/10
                        hover:bg-white/20
                        border
                        border-white/10
                        text-slate-200
                        transition-all
                    "
                >
                    ✕ Dismiss
                </button>

            </div>

            {/* Feature Cards */}
            <div className="
                grid
                md:grid-cols-3
                gap-5
                mb-10
            ">

                {[
                    {
                        icon: "📝",
                        title: "Create Smart Tasks",
                        desc:
                            "Create academic workflows with priorities, due dates, attachments and intelligent faculty assignments.",
                    },

                    {
                        icon: "🏷️",
                        title: "Advanced Tag Search",
                        desc:
                            "Search instantly using smart filters like #placement #exam #research #personal.",
                    },

                    {
                        icon: "📊",
                        title: "Track Productivity",
                        desc:
                            "Monitor overdue, pending and completed work using visual kanban-based task tracking.",
                    },
                ].map((item) => (

                    <motion.div
                        whileHover={{
                            y: -6,
                        }}

                        key={item.title}

                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-3xl
                            border
                            border-white/10
                            bg-white/5
                            backdrop-blur-xl
                            p-6
                            transition-all
                            duration-300
                        "
                    >

                        <div className="
                            absolute
                            inset-0
                            bg-gradient-to-br
                            from-indigo-500/10
                            to-violet-500/10
                            opacity-0
                            group-hover:opacity-100
                            transition
                        " />

                        <div className="relative z-10">

                            <div className="
                                w-16
                                h-16
                                rounded-2xl
                                bg-white/10
                                flex
                                items-center
                                justify-center
                                text-3xl
                                mb-5
                            ">
                                {item.icon}
                            </div>

                            <h3 className="
                                text-xl
                                font-bold
                                text-white
                                mb-3
                            ">
                                {item.title}
                            </h3>

                            <p className="
                                text-slate-300
                                leading-relaxed
                            ">
                                {item.desc}
                            </p>

                        </div>

                    </motion.div>
                ))}

            </div>

            {/* Bottom CTA */}
            <div className="
                flex
                flex-wrap
                items-center
                justify-center
                gap-4
            ">

                <button
                    onClick={createDemoTasks}
                    className="
                        px-8
                        py-4
                        rounded-2xl
                        bg-gradient-to-r
                        from-indigo-500
                        to-violet-600
                        text-white
                        font-bold
                        shadow-2xl
                        hover:scale-105
                        transition-all
                        duration-300
                    "
                >
                    ✨ Add Demo Tasks
                </button>

                <button
                    onClick={() => {

                        setOpenAssign(true);

                        localStorage.setItem(
                            "tutorialSeen",
                            "true"
                        );

                        setTutorialSeen(true);
                    }}

                    className="
                        px-8
                        py-4
                        rounded-2xl
                        border
                        border-white/20
                        bg-white/10
                        backdrop-blur-xl
                        text-white
                        font-semibold
                        hover:bg-white/20
                        transition-all
                        duration-300
                    "
                >
                    ➕ Create First Task
                </button>

            </div>

        </div>

    </motion.div>
)}

            {/* Kanban */}
            <div className="
                flex
                flex-col
                md:flex-row
                gap-4
            ">

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
                    onCardClick={(t) =>
                        completeTask(t.id)
                    }
                />

            </div>

            {/* MODAL */}
            <AnimatePresence>

                {openAssign && (

                    <motion.div className="
                        fixed
                        inset-0
                        bg-black/40
                        grid
                        place-items-center
                        z-50
                    ">

                        <motion.div className="
                            bg-white
                            rounded-3xl
                            w-full
                            max-w-2xl
                        ">

                            <div className="
                                p-6
                                flex
                                justify-between
                            ">

                                <h2>
                                    Create & Assign Task
                                </h2>

                                <button
                                    onClick={() =>
                                        setOpenAssign(false)
                                    }
                                >
                                    ✕
                                </button>

                            </div>

                            <form
                                onSubmit={createAndAssign}
                                className="
                                    p-6
                                    grid
                                    grid-cols-2
                                    gap-4
                                "
                            >

                                <input
                                    className="
                                        col-span-2
                                        border
                                        p-3
                                        rounded
                                    "
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                                <textarea
                                    className="
                                        col-span-2
                                        border
                                        p-3
                                        rounded
                                    "
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                    }
                                />

                                <textarea
                                    className="
                                        col-span-2
                                        border
                                        p-3
                                        rounded
                                    "
                                    placeholder="
                                    Assignment note
                                    (supports #tags like
                                    #placement #exam
                                    #personal)
                                    "
                                    value={assignmentNote}
                                    onChange={(e) =>
                                        setAssignmentNote(
                                            e.target.value
                                        )
                                    }
                                />

                                <select
                                    value={priority}
                                    onChange={(e) =>
                                        setPriority(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="low">
                                        Low
                                    </option>

                                    <option value="medium">
                                        Medium
                                    </option>

                                    <option value="high">
                                        High
                                    </option>

                                </select>

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) =>
                                        setDueDate(
                                            e.target.value
                                        )
                                    }
                                />

                                <select
                                    className="col-span-2"
                                    value={visibility}
                                    onChange={(e) => {

                                        const value =
                                            e.target.value;

                                        setVisibility(value);

                                        if (
                                            value !== "private"
                                        ) {

                                            setSelectedFaculties([]);

                                            setSelectedFacultyOptions([]);
                                        }
                                    }}
                                >

                                    <option value="private">
                                        Private
                                    </option>

                                    <option value="department">
                                        Department
                                    </option>

                                    <option value="public">
                                        Public
                                    </option>

                                </select>

                                <input
                                    type="file"
                                    className="col-span-2"
                                    onChange={(e) =>
                                        setFile(
                                            e.target.files[0]
                                        )
                                    }
                                />

                                {visibility !== "private" && (

                                    <div className="col-span-2">

                                        <Select
                                            isMulti
                                            placeholder="
                                            Select Departments
                                            "

                                            options={[
                                                {
                                                    value: "all",
                                                    label:
                                                        "Select All Departments",
                                                },

                                                ...departments.map((d) => ({
                                                    value: d.id,
                                                    label: d.name,
                                                })),
                                            ]}

                                            onChange={(sel) => {

                                                const values =
                                                    (sel || [])
                                                        .map(
                                                            (s) => s.value
                                                        );

                                                if (
                                                    values.includes("all")
                                                ) {

                                                    const allIds =
                                                        departments.map(
                                                            (d) => d.id
                                                        );

                                                    setSelectedDepartments(
                                                        allIds
                                                    );

                                                    loadFaculties(
                                                        allIds
                                                    );

                                                } else {

                                                    setSelectedDepartments(
                                                        values
                                                    );

                                                    loadFaculties(
                                                        values
                                                    );
                                                }
                                            }}
                                        />

                                    </div>
                                )}

                                {visibility !== "private" && (

                                    <div className="col-span-2">

                                        <Select
                                            isMulti

                                            value={
                                                selectedFacultyOptions
                                            }

                                            placeholder="
                                            Assign Faculties
                                            "

                                            options={[
                                                {
                                                    value: "all",

                                                    label:
                                                        "Select All Faculties",
                                                },

                                                ...faculties.map((f) => ({
                                                    value: f.id,
                                                    label: f.name,
                                                })),
                                            ]}

                                            onChange={(sel) => {

                                                setSelectedFacultyOptions(
                                                    sel || []
                                                );

                                                const values =
                                                    (sel || [])
                                                        .map(
                                                            (s) => s.value
                                                        );

                                                if (
                                                    values.includes("all")
                                                ) {

                                                    const allFacultyOptions =
                                                        faculties.map((f) => ({
                                                            value: f.id,
                                                            label: f.name,
                                                        }));

                                                    setSelectedFacultyOptions(
                                                        allFacultyOptions
                                                    );

                                                    setSelectedFaculties(
                                                        faculties.map(
                                                            (f) => f.id
                                                        )
                                                    );

                                                } else {

                                                    setSelectedFaculties(
                                                        values
                                                    );
                                                }
                                            }}
                                        />

                                    </div>
                                )}

                                <button className="
                                    col-span-2
                                    bg-blue-600
                                    text-white
                                    py-2
                                    rounded
                                ">
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
