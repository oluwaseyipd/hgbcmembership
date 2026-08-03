import { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Globe, X } from 'lucide-react';

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

  const navigation = [
    { name: "Overview", to: "/admin/overview", icon: LayoutDashboard },
    { name: "Members List", to: "/admin/members", icon: Users },
  ];

  return (
    <>
      {/* Mobile Sidebar Back Drop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div 
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 z-50 w-72 h-screen bg-slate-950 text-white flex flex-col border-r border-slate-900
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-900 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img 
              src="https://res.cloudinary.com/yttbshx3/image/upload/v1782975092/icon_logo_kajuv5.png" 
              alt="HGBC Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="font-bold tracking-tight text-white leading-tight">HGBC</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Membership</p>
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
          {navigation.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.name}
                to={item.to}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active 
                    ? "bg-brand-orange-600 text-white shadow-lg shadow-brand-orange-600/25" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Links */}
        <div className="p-4 border-t border-slate-900 space-y-2 flex-shrink-0">
          <Link
            to="/"
            onClick={() => window.innerWidth < 768 && toggleSidebar()}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <Globe className="w-5 h-5" />
            <span>Public Registration</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
