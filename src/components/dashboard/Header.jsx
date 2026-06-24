import { useEffect, useState } from "react";
import { Menu, User, Shield } from "lucide-react";

export default function Header({ toggleSidebar }) {
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("hgbc_admin_email") || "admin@hgbc.org";
    setAdminEmail(email);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-30 w-full flex-shrink-0">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg md:hidden text-slate-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider md:hidden">HGBC</span>
          <span className="text-sm font-bold text-slate-800 md:hidden">Members</span>
          
          <span className="hidden md:block text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Higher Ground Baptist Church
          </span>
          <h2 className="hidden md:block text-base font-bold text-slate-800">
            Membership Administration Portal
          </h2>
        </div>
      </div>

      {/* User Session Profile Info */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-800">System Administrator</span>
          <span className="text-xs text-slate-500">{adminEmail}</span>
        </div>
        <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600">
          <Shield className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
}
