import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

export default function Header({ toggleSidebar }) {
  const [adminEmail, setAdminEmail] = useState("");
  const location = useLocation();

  useEffect(() => {
    const email = localStorage.getItem("hgbc_admin_email") || "admin@hgbc.org";
    setAdminEmail(email);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/admin/overview")) return "Overview";
    if (path.startsWith("/admin/members")) return "Members List";
    return "Administration Portal";
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-6 sm:px-8 w-full flex-shrink-0">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl text-slate-650 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/60 rounded-full py-1.5 pl-3 pr-4">
          <div className="w-8 h-8 rounded-full bg-brand-orange-100 flex items-center justify-center text-brand-orange-700 font-bold text-sm select-none">
            A
          </div>
          <div className="hidden sm:block text-left leading-none">
            <p className="text-xs font-semibold text-slate-800">System Admin</p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">{adminEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
