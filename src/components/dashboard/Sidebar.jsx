import { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ExternalLink, LogOut, Shield, X } from 'lucide-react';

export default function Sidebar({ toggleSidebar, sidebarOpen }) {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
        toggleSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, toggleSidebar]);

  const handleLogout = () => {
    localStorage.removeItem("hgbc_admin_token");
    localStorage.removeItem("hgbc_admin_email");
    navigate("/signin", { replace: true });
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar Container */}
      <div 
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 z-50 w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="text-white text-xl font-bold tracking-wide">HGBC Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {/* Overview Link */}
          <Link
            to="/admin/overview"
            onClick={() => window.innerWidth < 768 && toggleSidebar()}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive("/admin/overview")
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/10 font-medium"
                : "text-slate-300 hover:text-white hover:bg-slate-700/40"
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 transition-colors ${
              isActive("/admin/overview") ? "text-white" : "text-slate-400 group-hover:text-blue-400"
            }`} />
            <span>Overview</span>
          </Link>
          
          {/* Members Link */}
          <Link
            to="/admin/members"
            onClick={() => window.innerWidth < 768 && toggleSidebar()}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive("/admin/members")
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/10 font-medium"
                : "text-slate-300 hover:text-white hover:bg-slate-700/40"
            }`}
          >
            <Users className={`w-5 h-5 transition-colors ${
              isActive("/admin/members") ? "text-white" : "text-slate-400 group-hover:text-purple-400"
            }`} />
            <span>Members List</span>
          </Link>

          {/* Spacer */}
          <div className="border-t border-slate-700/50 my-6"></div>

          {/* Public Portal Link */}
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-xl transition-all duration-200 group"
          >
            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-green-400" />
            <span>Public Registration</span>
          </Link>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-600/20 rounded-xl transition-all duration-200 font-medium cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          <div className="text-[10px] text-slate-500 text-center mt-4">
            © {new Date().getFullYear()} HGBC. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}
