import { useState, useEffect } from "react";
import PriorityTag from "./PriorityTag";
import {
  HiOutlineChatAlt2,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { FiCheck, FiRefreshCcw } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import API from "../api";
import toast from "react-hot-toast";
import Select from "react-select";

export default function TaskCard({ task, onClick, refresh }) {
  const t = task?.tasks || task || {};

  const priority = t.priority || "medium";
  const title = t.title || "Untitled task";
  const description = t.description || "No description provided.";
  const dueDate = t?.due_date ? new Date(t.due_date) : null;

  const isCompleted = task?.status === "completed";

  let currentUserId = null;
  try {
    currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
  } catch { }

  const isAssignedToMe =
    task?.faculty_id && task.faculty_id === currentUserId;

  const isCreatedByMe =
    t?.assigned_by && t.assigned_by === currentUserId;

  const now = new Date();

  let dueStatus = "normal";
  if (dueDate && dueDate < now && !isCompleted) dueStatus = "overdue";
  else if (dueDate && (dueDate - now) / (1000 * 60 * 60 * 24) < 2)
    dueStatus = "urgent";

  /* ---------------- MODAL STATE ---------------- */
  const [openModal, setOpenModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");

  /* 🔥 LOAD DEPARTMENTS */
  useEffect(() => {
    if (!openModal) return;

    const loadDepartments = async () => {
      try {
        const res = await API.get("/api/tasks/departments");
        let data = res.data || [];

        // ✅ Add Select All option
        data = [{ id: "all", name: "Select All Departments" }, ...data];

        setDepartments(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadDepartments();
  }, [openModal]);

  /* 🔥 LOAD FACULTIES */
  const loadFaculties = async (deptIds = []) => {
    try {
      let url = "/api/tasks/faculties";

      if (deptIds.length && !deptIds.includes("all")) {
        url += `?department_id=${deptIds.join(",")}`;
      }

      const res = await API.get(url);
      let data = res.data || [];

      // ✅ Add Select All option
      data = [{ id: "all", name: "Select All Faculties" }, ...data];

      setFaculties(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- ACTIONS ---------------- */

  const handleComplete = async (e) => {
    e.stopPropagation();
    try {
      await API.put(`/api/tasks/complete/${task.id}`);
      refresh?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFaculty) {
      toast.error("Please select a faculty");
      return;
    }

    if (selectedFaculty.value === "all") {
      toast.error("Select one faculty only");
      return;
    }

    try {
      await API.put("/api/tasks/reassign", {
        assignment_id: task.id,
        new_faculty_id: selectedFaculty.value,
        due_date: newDueDate || undefined,
      });

      toast.success("Task reassigned successfully 🎉");

      setOpenModal(false);
      setSelectedFaculty(null);
      setSelectedDepartments([]);
      setNewDueDate("");

      refresh?.();
    } catch (err) {
      console.error(err);
      toast.error("Reassign failed ❌");
    }
  };

  const handleDelete = async (e) => {
  e.stopPropagation();

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmDelete) return;

  try {

    await API.delete(`/api/tasks/delete/${t.id}`);

    toast.success("Task deleted successfully 🗑️");

    refresh?.();

  } catch (err) {

    console.error(err);

    toast.error("Delete failed ❌");
  }
};

  /* ---------------- AVATAR SEED ---------------- */
  const seed = String(task?.id || title)
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);

  const avatars = Array.from({ length: (seed % 3) + 1 });

  return (
    <>
      {/* ================= CARD ================= */}
      <div
        onClick={onClick}
        className={`
        group relative p-4 rounded-2xl border bg-white/70 backdrop-blur-xl
        shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer
        
        ${isCompleted ? "opacity-75" : ""}
        
        before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 
        before:rounded-l-2xl
        
        ${dueStatus === "overdue"
            ? "before:bg-red-500"
            : dueStatus === "urgent"
              ? "before:bg-yellow-400"
              : "before:bg-[color:var(--brand)]"
          }
      `}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <PriorityTag priority={priority} />

          <div className="flex gap-1">
            {isCreatedByMe && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                Creator
              </span>
            )}

            {isAssignedToMe && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                Assigned
              </span>
            )}

            {isCompleted && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-600">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="mt-2 font-semibold text-gray-800 leading-snug group-hover:text-[color:var(--brand)] transition">
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
          {description}
        </p>

        {/* FOOTER */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex -space-x-2">
            {avatars.map((_, i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-full border-2 border-white grid place-items-center text-[10px] font-semibold text-white shadow"
                style={{
                  background: `oklch(0.65 0.18 ${(i * 80 + seed) % 360})`,
                }}
              >
                {String.fromCharCode(65 + ((seed + i) % 26))}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isAssignedToMe && !isCompleted && (
              <button
                onClick={handleComplete}
                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 hover:scale-105 transition"
              >
                <FiCheck size={14} />
              </button>
            )}

            {isCreatedByMe && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal(true);
                }}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105 transition"
              >
                <FiRefreshCcw size={14} />
              </button>
         <button
      onClick={handleDelete}
      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:scale-105 transition"
    >
      <FiTrash2 size={14} />
    </button>
            )}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HiOutlineChatAlt2 /> {(seed % 50) + 3}
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineCheckCircle /> {((seed * 3) % 200) + 10}
            </span>
          </div>

          {dueDate && (
            <span
              className={`font-medium ${dueStatus === "overdue"
                ? "text-red-500"
                : dueStatus === "urgent"
                  ? "text-yellow-500"
                  : "text-gray-400"
                }`}
            >
              ⏳ {dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {openModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setOpenModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4"
          >
            <h2 className="text-lg font-semibold">🔄 Reassign Task</h2>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              {/* Department Select */}
              <Select
                isMulti
                placeholder="Select Department"
                options={departments.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
                onChange={(sel) => {
                  const vals = (sel || []).map((s) => s.value);

                  if (vals.includes("all")) {
                    const allIds = departments
                      .filter((d) => d.id !== "all")
                      .map((d) => d.id);

                    setSelectedDepartments(allIds);
                    loadFaculties(allIds);
                  } else {
                    setSelectedDepartments(vals);
                    loadFaculties(vals);
                  }
                }}
              />

              {/* Faculty Select */}
              <Select
                placeholder="Search Faculty"
                options={faculties.map((f) => ({
                  value: f.id,
                  label: f.name,
                }))}
                value={selectedFaculty}
                onChange={(sel) => {
                  if (sel?.value === "all") {
                    alert("⚠️ Select one faculty only");
                    return;
                  }
                  setSelectedFaculty(sel);
                }}
              />

              {/* Due Date */}
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[color:var(--brand)] text-white rounded-xl"
                >
                  Reassign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
