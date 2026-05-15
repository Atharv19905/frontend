import { useState, useEffect } from "react";
import PriorityTag from "./PriorityTag";
import { FiCheck, FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import API from "../api";
import toast from "react-hot-toast";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

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
  } catch {}

  const isAssignedToMe =
    task?.faculty_id && task.faculty_id === currentUserId;

  const isCreatedByMe =
    t?.assigned_by && t.assigned_by === currentUserId;

  const now = new Date();

  let dueStatus = "normal";

  if (dueDate && dueDate < now && !isCompleted) {
    dueStatus = "overdue";
  } else if (
    dueDate &&
    (dueDate - now) / (1000 * 60 * 60 * 24) < 2
  ) {
    dueStatus = "urgent";
  }

  /* ---------------- MODAL STATE ---------------- */

  const [openModal, setOpenModal] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const [newDueDate, setNewDueDate] = useState("");
  const [reassignReason, setReassignReason] = useState("");

  /* ---------------- LOAD DEPARTMENTS ---------------- */

  useEffect(() => {
    if (!openModal) return;

    const loadDepartments = async () => {
      try {
        const res = await API.get("/api/tasks/departments");

        let data = res.data || [];

        data = [{ id: "all", name: "Select All Departments" }, ...data];

        setDepartments(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadDepartments();
  }, [openModal]);

  /* ---------------- LOAD FACULTIES ---------------- */

  const loadFaculties = async (deptIds = []) => {
    try {
      let url = "/api/tasks/faculties";

      if (deptIds.length && !deptIds.includes("all")) {
        url += `?department_id=${deptIds.join(",")}`;
      }

      const res = await API.get(url);

      let data = res.data || [];

      data = [{ id: "all", name: "Select All Faculties" }, ...data];

      setFaculties(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- COMPLETE TASK ---------------- */

  const handleComplete = async (e) => {
    e.stopPropagation();

    try {
      await API.put(`/api/tasks/complete/${task.id}`);

      toast.success("Task marked as completed ✅");

      refresh?.();
    } catch (err) {
      console.error(err);

      toast.error("Failed to complete task ❌");
    }
  };

  /* ---------------- REASSIGN TASK ---------------- */

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
        reason: reassignReason,
      });

      toast.success("Task reassigned successfully 🎉");

      setOpenModal(false);

      setSelectedFaculty(null);
      setSelectedDepartments([]);

      setNewDueDate("");
      setReassignReason("");

      refresh?.();
    } catch (err) {
      console.error(err);

      toast.error("Reassign failed ❌");
    }
  };

  /* ---------------- DELETE TASK ---------------- */

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

  /* ---------------- CARD UI ---------------- */

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={`
          group relative overflow-hidden rounded-3xl border border-white/40
          bg-white/80 backdrop-blur-2xl
          shadow-[0_8px_30px_rgb(0,0,0,0.06)]
          hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)]
          transition-all duration-300
          p-5 cursor-pointer

          ${isCompleted ? "opacity-75" : ""}
        `}
      >
        {/* LEFT BORDER */}
        <div
          className={`
            absolute left-0 top-0 h-full w-1.5 rounded-l-3xl

            ${
              dueStatus === "overdue"
                ? "bg-red-500"
                : dueStatus === "urgent"
                ? "bg-yellow-400"
                : "bg-[color:var(--brand)]"
            }
          `}
        />

        {/* TOP SECTION */}
        <div className="flex justify-between items-start gap-3">
          <PriorityTag priority={priority} />

          <div className="flex flex-wrap justify-end gap-1">
            {isCreatedByMe && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                Creator
              </span>
            )}

            {isAssignedToMe && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
                Assigned
              </span>
            )}

            {isCompleted && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="mt-4 text-[17px] font-semibold text-gray-800 leading-snug group-hover:text-[color:var(--brand)] transition">
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-3">
          {description}
        </p>

        {/* DUE DATE */}
        {dueDate && (
          <div className="mt-4 flex items-center justify-between">
            <span
              className={`
                text-xs font-medium px-3 py-1 rounded-full

                ${
                  dueStatus === "overdue"
                    ? "bg-red-100 text-red-600"
                    : dueStatus === "urgent"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-500"
                }
              `}
            >
              ⏳ {dueDate.toLocaleDateString()}
            </span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-5 flex items-center justify-end gap-2">
          {isAssignedToMe && !isCompleted && (
            <button
              title="Mark Complete"
              onClick={handleComplete}
              className="
                h-10 w-10 rounded-xl
                bg-green-100 text-green-600
                hover:bg-green-200
                hover:scale-105
                active:scale-95
                transition
                grid place-items-center
              "
            >
              <FiCheck size={16} />
            </button>
          )}

          {isCreatedByMe && (
            <>
              <button
                title="Reassign Task"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal(true);
                }}
                className="
                  h-10 w-10 rounded-xl
                  bg-blue-100 text-blue-600
                  hover:bg-blue-200
                  hover:scale-105
                  active:scale-95
                  transition
                  grid place-items-center
                "
              >
                <FiRefreshCcw size={16} />
              </button>

              <button
                title="Delete Task"
                onClick={handleDelete}
                className="
                  h-10 w-10 rounded-xl
                  bg-red-100 text-red-600
                  hover:bg-red-200
                  hover:scale-105
                  active:scale-95
                  transition
                  grid place-items-center
                "
              >
                <FiTrash2 size={16} />
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* ================= MODAL ================= */}

      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpenModal(false);
              setReassignReason("");
            }}
            className="
              fixed inset-0 z-50
              bg-black/40 backdrop-blur-sm
              flex items-center justify-center
              p-4
            "
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="
                w-full max-w-md
                rounded-3xl
                bg-white
                shadow-2xl
                border border-gray-100
                overflow-hidden
              "
            >
              {/* HEADER */}
              <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800">
                  🔄 Reassign Task
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Assign this task to another faculty member
                </p>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleReassignSubmit}
                className="p-6 space-y-4"
              >
                {/* DEPARTMENT */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Department
                  </label>

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
                </div>

                {/* FACULTY */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Faculty
                  </label>

                  <Select
                    placeholder="Search Faculty"
                    options={faculties.map((f) => ({
                      value: f.id,
                      label: f.name,
                    }))}
                    value={selectedFaculty}
                    onChange={(sel) => {
                      if (sel?.value === "all") {
                        toast.error("Select one faculty only");
                        return;
                      }

                      setSelectedFaculty(sel);
                    }}
                  />
                </div>

                {/* REASON */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Reason
                  </label>

                  <textarea
                    placeholder="Enter reason for reassignment..."
                    value={reassignReason}
                    onChange={(e) =>
                      setReassignReason(e.target.value)
                    }
                    className="
                      w-full min-h-[100px]
                      rounded-2xl border border-gray-200
                      px-4 py-3
                      text-sm
                      outline-none
                      focus:ring-2 focus:ring-blue-200
                      focus:border-blue-400
                      transition
                    "
                    required
                  />
                </div>

                {/* DUE DATE */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    New Due Date
                  </label>

                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="
                      w-full rounded-2xl border border-gray-200
                      px-4 py-3 text-sm
                      outline-none
                      focus:ring-2 focus:ring-blue-200
                      focus:border-blue-400
                      transition
                    "
                  />
                </div>

                {/* BUTTONS */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenModal(false);
                      setReassignReason("");
                    }}
                    className="
                      px-5 py-2.5 rounded-2xl
                      bg-gray-100 text-gray-700
                      hover:bg-gray-200
                      transition
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="
                      px-5 py-2.5 rounded-2xl
                      bg-[color:var(--brand)]
                      text-white
                      hover:opacity-90
                      shadow-lg shadow-blue-200/50
                      transition
                    "
                  >
                    Reassign Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
