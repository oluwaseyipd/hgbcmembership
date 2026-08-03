import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex w-full overflow-hidden h-screen">
      {/* Sidebar wrapper */}
      <div className="flex-shrink-0">
        <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      </div>

      {/* Main Content Side */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Scrollable Content Wrapper */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full mx-auto bg-slate-50">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
