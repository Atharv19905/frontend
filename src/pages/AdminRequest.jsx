import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api";
import toast from "react-hot-toast";

export default function AdminRequest() {

    const [organizations, setOrganizations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isExistingOrg, setIsExistingOrg] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        organization_name: "",
        organization_id: "",
        department: ""
    });

    useEffect(() => {
        API.get("/api/admin/organisations")
            .then(res => setOrganizations(res.data || []))
            .catch(() => toast.error("Failed to load organizations"));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOrgChange = async (e) => {
        const value = e.target.value;

        setForm({
            ...form,
            organization_id: value,
            organization_name: "",
            department: ""
        });

        setIsExistingOrg(!!value);

        if (value) {
            try {
                const res = await API.get(`/api/admin/departments?organization_id=${value}`);
                setDepartments(res.data || []);
            } catch {
                toast.error("Failed to load departments");
            }
        } else {
            setDepartments([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await API.post("/api/admin-request/request-admin", form);

            toast.success(res.data.message);

            setForm({
                name: "",
                email: "",
                password: "",
                organization_name: "",
                organization_id: "",
                department: ""
            });

        } catch (err) {
            toast.error(err?.response?.data?.message || "Request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">

            <motion.form
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-lg"
            >

                <h1 className="text-2xl font-bold text-center mb-6 text-indigo-600">
                    Request Admin Account
                </h1>

                <input name="name" placeholder="Full Name" required
                    value={form.name} onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-lg mb-3" />

                <input name="email" type="email" placeholder="Email" required
                    value={form.email} onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-lg mb-3" />

                <input name="password" type="password" placeholder="Password" required
                    value={form.password} onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-lg mb-3" />

                {/* ORGANIZATION */}
                <select onChange={handleOrgChange}
                    className="w-full border px-4 py-2 rounded-lg mb-3">
                    <option value="">Create New Organization</option>
                    {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </select>

                {!isExistingOrg && (
                    <input name="organization_name" placeholder="Organization Name" required
                        value={form.organization_name} onChange={handleChange}
                        className="w-full border px-4 py-2 rounded-lg mb-3" />
                )}

                {/* DEPARTMENT */}
                {isExistingOrg ? (
                    <>
                        <select name="department" value={form.department}
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded-lg mb-2">
                            <option value="">Select department</option>
                            {departments.map(dep => (
                                <option key={dep.id} value={dep.name}>{dep.name}</option>
                            ))}
                        </select>

                        <input name="department" placeholder="Or type new department"
                            value={form.department} onChange={handleChange}
                            className="w-full border px-4 py-2 rounded-lg mb-4" />
                    </>
                ) : (
                    <input name="department" placeholder="Department" required
                        value={form.department} onChange={handleChange}
                        className="w-full border px-4 py-2 rounded-lg mb-4" />
                )}

                <button disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg">
                    {loading ? "Submitting..." : "Submit Request"}
                </button>

            </motion.form>

        </div>
    );
}