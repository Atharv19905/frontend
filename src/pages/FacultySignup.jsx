import { useEffect, useState } from "react";
import API from "../api";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function FacultySignup() {
    const [departments, setDepartments] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deptLoading, setDeptLoading] = useState(false); // ✅ ADDED

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        department_id: "",
        organization_id: ""
    });

    useEffect(() => {
        API.get("/api/admin/departments")
            .then((r) => setDepartments(r.data || []))
            .catch(() => {
                toast.error("Failed to load departments ❌");
            });

        API.get("/api/admin/organisations")
            .then((r) => setOrganizations(r.data || []))
            .catch(() => {
                toast.error("Failed to load organizations ❌");
            });

    }, []);

    const handleChange = async (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "organization_id" ? { department_id: "" } : {})
        }));

        // ✅ Improved department loading UX
        if (name === "organization_id") {
            try {
                setDeptLoading(true);

                const res = await API.get(
                    `/api/admin/departments?organization_id=${value}`
                );

                setDepartments(res.data || []);
            } catch (err) {
                toast.error("Failed to load departments");
                setDepartments([]);
            } finally {
                setDeptLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.department_id || !form.organization_id) {
            toast.error("Please select organization and department");
            return;
        }

        try {
            setLoading(true);

            const res = await API.post("/api/auth/signup", form);

            // ✅ Better message
            toast.success("Request sent to your organization admin for approval ✅");

            setForm({
                name: "",
                email: "",
                password: "",
                department_id: "",
                organization_id: ""
            });

        } catch (err) {
            toast.error(err?.response?.data?.message || "Signup failed ❌");
        } finally {
            setLoading(false);
        }
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
                <div className="absolute -top-20 -right-12 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-pulse" />

                <div className="relative flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white text-[color:var(--brand)] grid place-items-center font-bold">
                        TNX
                    </div>
                    <span className="font-bold text-lg">TaskNexus</span>
                </div>

                <div className="relative">
                    <h2 className="text-4xl font-bold leading-tight">
                        Join your department.<br />Get on the board.
                    </h2>
                    <p className="mt-4 text-white/80 max-w-md">
                        Create your faculty account and start receiving assignments instantly.
                    </p>
                </div>

                <p className="relative text-xs text-white/60">
                    © 2026 TaskNexus
                </p>
            </div>

            {/* RIGHT FORM */}
            <div className="flex items-center justify-center p-6 bg-white">

                <motion.form
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="w-full max-w-md"
                >
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create account
                    </h1>

                    <p className="text-sm text-[color:var(--ink-muted)] mt-1 mb-8">
                        Faculty signup — admin will review
                    </p>

                    {/* NAME */}
                    <input
                        name="name"
                        placeholder="Full name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border mb-3"
                    />

                    {/* EMAIL */}
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border mb-3"
                    />

                    {/* PASSWORD */}
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border mb-3"
                    />

                    {/* ORGANIZATION */}
                    <select
                        name="organization_id"
                        required
                        value={form.organization_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border mb-3"
                    >
                        <option value="">Select organization</option>
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))}
                    </select>

                    {/* DEPARTMENT */}
                    <select
                        name="department_id"
                        required
                        value={form.department_id}
                        onChange={handleChange}
                        disabled={!form.organization_id || deptLoading}
                        className="w-full px-4 py-3 rounded-xl border mb-2"
                    >
                        <option value="">
                            {deptLoading ? "Loading..." : "Select department"}
                        </option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>

                    {/* ✅ No departments message */}
                    {departments.length === 0 && form.organization_id && !deptLoading && (
                        <p className="text-sm text-red-500 mb-3">
                            No departments found for this organization
                        </p>
                    )}

                    {/* SUBMIT */}
                    <button
                        disabled={loading || !form.organization_id || !form.department_id}
                        className="w-full bg-[color:var(--brand)] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                        {loading ? "Signing up..." : "Sign up"}
                    </button>

                    <p className="mt-6 text-sm text-center">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[color:var(--brand)] font-semibold">
                            Sign in
                        </Link>
                    </p>
                </motion.form>

            </div>
        </div>
    );
}
