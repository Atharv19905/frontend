import Sidebar from "./Sidebar";

export default function AppShell({ children, userName, userRole }) {
  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, oklch(0.62 0.22 280) 0%, oklch(0.55 0.24 285) 100%)" }}>
      <Sidebar userName={userName} userRole={userRole} />
      <main className="flex-1 m-3 ml-0 rounded-3xl bg-white shadow-panel overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-soft p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
