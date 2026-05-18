import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";

// --- ANIMATED NUMBER COMPONENT ---
function AnimatedNumber({ value }) {
    const nodeRef = useRef(null);
    useEffect(() => {
        const node = nodeRef.current;
        if (node) {
            const controls = animate(0, value, {
                duration: 2.5,
                ease: [0.16, 1, 0.3, 1],
                onUpdate: (v) => { node.textContent = Math.round(v); }
            });
            return controls.stop;
        }
    }, [value]);
    return <span ref={nodeRef} />;
}

// --- 3D TILT CARD COMPONENT ---
function TiltCard({ children, className }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`relative group perspective-[1000px] ${className}`}
        >
            <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="h-full w-full">
                {children}
            </div>
        </motion.div>
    );
}

// --- AMBIENT PARTICLES COMPONENT ---
function AmbientParticles() {
    // Generates static random values for 30 particles to avoid hydration mismatches
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 1,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: Math.random() * 20 + 20,
        delay: Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-indigo-500/20"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.initialX}%`,
                        top: `${p.initialY}%`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        opacity: [0.1, 0.6, 0.1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
}

export default function HomePage() {
    // ---------------------------------------------------------
    // BACKEND LOGIC & STATE (STRICTLY UNCHANGED)
    // ---------------------------------------------------------
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const isLoggedIn = !!token && !!user;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const goToDashboard = () => {
        if (user?.role === "admin") navigate("/admin-dashboard");
        else if (user?.role === "faculty") navigate("/faculty-dashboard");
    };

    // Track mouse for ambient spotlight
    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", updateMousePosition);
        return () => window.removeEventListener("mousemove", updateMousePosition);
    }, []);
    // ---------------------------------------------------------

    // --- ADVANCED SCROLL ANIMATIONS ---
    const { scrollYProgress } = useScroll();
    const mockupRotateX = useTransform(scrollYProgress, [0, 0.15], [20, 0]);
    const mockupScale = useTransform(scrollYProgress, [0, 0.15], [0.9, 1]);
    const mockupY = useTransform(scrollYProgress, [0, 0.15], [80, 0]);

    // Framer Motion Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFA] text-slate-900 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* 🌈 ENHANCED BACKGROUND SYSTEM */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">

                {/* 1. Base Gradient & Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,#FAFAFA_80%)] z-10" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

                {/* 2. Interactive Spotlight */}
                <motion.div
                    className="absolute inset-0 z-10 transition-opacity duration-300"
                    animate={{ background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99,102,241,0.05), transparent 80%)` }}
                />

                {/* 3. Floating Particles (The Data Flow) */}
                <AmbientParticles />

                {/* 4. Abstract Wireframe Geometrics (Academic/Tech Vibe) */}
                <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] text-slate-200/40 z-0"
                    viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.2"
                >
                    <circle cx="50" cy="50" r="40" />
                    <circle cx="50" cy="50" r="30" />
                    <circle cx="50" cy="50" r="20" />
                    <path d="M10 50h80M50 10v80M20 20l60 60M20 80l60-60" />
                </motion.svg>

                <motion.svg
                    animate={{ rotate: -360 }}
                    transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] text-indigo-200/30 z-0"
                    viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.2"
                >
                    <polygon points="50,10 90,90 10,90" />
                    <polygon points="50,90 90,10 10,10" />
                </motion.svg>

                {/* 5. Slow moving aurora blurs */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute left-[10%] top-[-10%] z-0 h-[40vw] w-[40vw] rounded-full bg-blue-400/15 blur-[120px]" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute right-[10%] top-[20%] z-0 h-[35vw] w-[35vw] rounded-full bg-purple-400/10 blur-[120px]" />
            </div>

            {/* 🧭 FLOATING ISLAND NAVBAR */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
                <nav className="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-full border border-white/60 bg-white/60 px-5 py-3 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5">

                    <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer group px-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-hover:shadow-indigo-500/30">
                            <span className="text-white font-black text-xs tracking-tighter">TNX</span>
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            TaskNexus
                        </h1>
                    </div>

                    <div className="flex gap-2 items-center">
                        {!isLoggedIn ? (
                            <>
                                <button onClick={() => navigate("/login")} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors px-5 py-2.5 rounded-full hover:bg-slate-100/60">
                                    Login
                                </button>
                                <button onClick={() => navigate("/signup")} className="relative text-sm font-semibold px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all active:scale-95 group overflow-hidden">
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={goToDashboard} className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-6 py-2.5 rounded-full border border-indigo-100/50 transition-colors">
                                    Dashboard
                                </button>
                                <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors px-5 py-2.5 rounded-full">
                                    Log out
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            </div>

            {/* 🚀 CENTRALIZED HERO SECTION */}
            <section className="relative z-10 mx-auto max-w-5xl px-6 pt-48 pb-24 text-center">
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col items-center">

                    <motion.div variants={fadeUp} whileHover={{ scale: 1.05 }} className="group relative inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200/50 bg-white/50 backdrop-blur-md px-5 py-2 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8 cursor-pointer hover:bg-white shadow-sm transition-all">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
                        Next-Gen Academic Engine
                    </motion.div>

                    <motion.h1 variants={fadeUp} className="max-w-4xl text-6xl md:text-[80px] font-black tracking-tighter text-slate-900 leading-[1.05] pb-4">
                        Run Your Faculty <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                            Like a Product Team
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeUp} className="mt-4 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Assign tasks, track progress, and analyze performance — all in one intelligent platform built for modern institutions.
                    </motion.p>

                    <motion.div variants={fadeUp} className="mt-12 flex justify-center gap-4 flex-wrap">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                            <button onClick={() => navigate("/signup")} className="px-8 py-4 rounded-full bg-slate-900 text-white font-bold shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:bg-slate-800 transition-all flex items-center gap-2">
                                Deploy Workspace
                                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                            <button onClick={() => navigate("/login")} className="px-8 py-4 rounded-full bg-white text-slate-700 font-bold border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
                                Login
                            </button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                            <button onClick={() => navigate("/request-admin")} className="px-8 py-4 rounded-full bg-indigo-50/50 text-indigo-700 font-bold border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all backdrop-blur-sm">
                                Request Admin Access
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            {/* 💻 SCROLL-LINKED CINEMATIC APP MOCKUP */}
            <section className="relative z-20 mx-auto max-w-6xl px-6 pb-32 perspective-[2000px]">
                <motion.div
                    style={{ rotateX: mockupRotateX, scale: mockupScale, y: mockupY }}
                    className="rounded-[2.5rem] border border-white/80 bg-white/40 p-2 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.07)] ring-1 ring-slate-900/5 transform-gpu"
                >
                    <div className="rounded-[2rem] overflow-hidden bg-white border border-slate-100/80 shadow-inner relative">

                        <div className="bg-slate-50/90 border-b border-slate-100 px-5 py-4 flex items-center justify-between backdrop-blur-md">
                            <div className="flex gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-300 hover:bg-rose-400 transition-colors" />
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-300 hover:bg-amber-400 transition-colors" />
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-300 hover:bg-emerald-400 transition-colors" />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-white text-[11px] font-semibold text-slate-400 shadow-sm border border-slate-200/50">
                                <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                facultyflow.app/command
                            </div>
                            <div className="w-16" />
                        </div>

                        <div className="p-8 md:p-12 min-h-[450px] relative overflow-hidden">
                            <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

                            <div className="flex justify-between items-end mb-10 relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Active Pipeline</h3>
                                    <p className="text-slate-500 mt-2 font-medium">Computer Science & Engineering</p>
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                    Live Sync Active
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 relative z-10">
                                {[
                                    { title: "Tasks Assigned", val: 42, color: "text-indigo-600", bg: "from-indigo-50/50 to-white" },
                                    { title: "In Progress", val: 18, color: "text-amber-600", bg: "from-amber-50/50 to-white" },
                                    { title: "Completed", val: 128, color: "text-emerald-600", bg: "from-emerald-50/50 to-white" },
                                ].map((stat, idx) => (
                                    <div key={idx} className={`p-6 rounded-2xl bg-gradient-to-br ${stat.bg} border border-slate-100 shadow-sm`}>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                                        <h2 className={`text-5xl font-black mt-3 tracking-tighter ${stat.color}`}>
                                            <AnimatedNumber value={stat.val} />
                                        </h2>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-3 relative z-10">
                                {[
                                    { title: "Review CS101 Syllabus", status: "In Progress", dot: "bg-amber-500", tagBg: "bg-amber-100 text-amber-700" },
                                    { title: "Submit Grant Proposal", status: "Completed", dot: "bg-emerald-500", tagBg: "bg-emerald-100 text-emerald-700" },
                                    { title: "Quarterly Assessments", status: "Pending", dot: "bg-slate-400", tagBg: "bg-slate-100 text-slate-700" },
                                ].map((item, idx) => (
                                    <motion.div whileHover={{ scale: 1.01, x: 5 }} key={idx} className="flex justify-between items-center p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-2.5 w-2.5 rounded-full ${item.dot} shadow-[0_0_8px] shadow-${item.dot.replace('bg-', '')}/50`} />
                                            <span className="font-bold text-slate-700 text-sm">{item.title}</span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${item.tagBg}`}>{item.status}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ✨ FEATURES (3D Magnetic Tilt Bento Grid) */}
            <section className="relative z-20 mx-auto max-w-6xl px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Smart Assignment", desc: "Auto distribute tasks across faculty based on workload.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                        { title: "Real-time Tracking", desc: "Monitor progress instantly with live updates.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                        { title: "Analytics Dashboard", desc: "Data-driven performance insights for your department.", icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" }
                    ].map((feature, idx) => (
                        <TiltCard key={idx}>
                            <div className="h-full rounded-[2.5rem] bg-white border border-slate-200/80 p-8 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-shadow duration-500 relative overflow-hidden group">
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg mb-8 group-hover:bg-indigo-600 transition-colors duration-500">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                                        </svg>
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{feature.title}</h4>
                                    <p className="mt-3 text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </section>

            {/* 🧊 STRICT MINIMAL FOOTER */}
            <footer className="relative z-20 border-t border-slate-200/60 bg-white/50 backdrop-blur-md py-10 mt-10">
                <div className="max-w-7xl mx-auto px-6 flex justify-center items-center">
                    <div className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors cursor-default">
                        <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm">
                            <span className="text-[10px] font-black">FF</span>
                        </div>
                        <p className="text-sm font-bold tracking-widest uppercase">
                            © 2026 TaskNexus Inc.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
