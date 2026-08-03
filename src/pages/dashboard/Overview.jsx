import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { Users, GraduationCap, Heart, CheckCircle2, ShieldAlert } from "lucide-react";
import { API_URL } from "../../constants/api";

const GENDER_COLORS = ["#ea580c", "#3b82f6", "#a855f7", "#ec4899", "#10b981"];

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("hgbc_admin_token");
        const res = await fetch(`${API_URL}/api/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "Failed to fetch stats");
        }
        setStats(result);
      } catch (err) {
        console.error(err);
        setError("Error loading metrics. Please verify the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-orange-500/20 border-t-brand-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200/50 p-6 rounded-2xl flex flex-col items-center gap-4 text-center mt-8">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <div>
          <h3 className="text-lg font-bold">Failed to Load Overview</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate card counts
  const total = stats.totalMembers;
  const lautechYes = (stats.lautechStudent.find(s => s.lautech_student === "Yes") || { count: 0 }).count;
  const bornAgainYes = (stats.bornAgain.find(s => s.born_again === "Yes") || { count: 0 }).count; 
  const singleCount = (stats.maritalStatus.find(m => m.marital_status === "Single") || { count: 0 }).count;

  // Prepare gender chart data
  const genderChartData = stats.gender.map(g => ({
    name: g.gender || "Not Specified",
    value: g.count
  }));

  // Prepare age-range chart data
  const ageChartData = stats.ageRange.map(a => ({
    name: a.age_range || "Unknown",
    Count: a.count
  }));

  // Prepare discipleship class completion chart data
  const discipleshipChartData = stats.discipleship.map(d => ({
    name: d.name,
    Completes: d.count
  }));

  // Prepare trend chart data
  const trendChartData = stats.trend.map(t => ({
    Month: t.month,
    Registrations: t.count
  }));

  // Prepare current-level chart data
  const levelChartData = stats.currentLevel ? stats.currentLevel.map(l => ({
    name: l.current_level,
    Count: l.count
  })) : [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-orange-700/30 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome to HGBC Membership Portal</h3>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Manage registered members, analyze demographic distributions, and track discipleship growth. All data updates instantly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link 
              to="/admin/members" 
              className="bg-brand-orange-600 hover:bg-brand-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center space-x-2 transition-all shadow-md shadow-brand-orange-600/35"
            >
              <Users className="w-4 h-4" />
              <span>Manage Members</span>
            </Link>
            <Link 
              to="/" 
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all backdrop-blur"
            >
              Registration Form
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand-orange-500 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Members", value: total, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "LAUTECH Students", value: lautechYes, icon: GraduationCap, color: "text-purple-600 bg-purple-50" },
          { label: "Born Again", value: bornAgainYes, icon: Heart, color: "text-brand-orange-600 bg-brand-orange-50" },
          { label: "Single Members", value: singleCount, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" }
        ].map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
            <div className={`p-3.5 rounded-xl ${metric.color}`}>
              <metric.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Registration Growth Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="mb-4">
            <h4 className="font-bold text-slate-900">Registration Growth Trend</h4>
            <p className="text-xs text-slate-500">Monthly registration trend analysis</p>
          </div>
          {trendChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="Month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Line type="monotone" dataKey="Registrations" stroke="#ea580c" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No trend data available.</div>
          )}
        </div>

        {/* Age Range Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="mb-4">
            <h4 className="font-bold text-slate-900">Age Range Distribution</h4>
            <p className="text-xs text-slate-500">Breakdown of members by age groups</p>
          </div>
          {ageChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="Count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No age data available.</div>
          )}
        </div>

        {/* Discipleship Completion Stats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="mb-4">
            <h4 className="font-bold text-slate-900">Discipleship Completion Stats</h4>
            <p className="text-xs text-slate-500">Progress in church discipleship programs</p>
          </div>
          {discipleshipChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={discipleshipChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={120} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="Completes" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No discipleship completions recorded.</div>
          )}
        </div>

        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="mb-4">
            <h4 className="font-bold text-slate-900">Gender Distribution</h4>
            <p className="text-xs text-slate-500">Gender ratio breakdown of registered members</p>
          </div>
          {genderChartData.length > 0 ? (
            <div className="h-72 flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="w-full sm:w-1/2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {genderChartData.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GENDER_COLORS[idx % GENDER_COLORS.length] }}></div>
                    <span className="text-xs font-semibold text-slate-700">{g.name}:</span>
                    <span className="text-xs text-slate-500 font-bold">{g.value} members</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No gender data available.</div>
          )}
        </div>

        {/* Academic Level Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h4 className="font-bold text-slate-900">Academic Level Distribution</h4>
            <p className="text-xs text-slate-500">LAUTECH student counts across levels</p>
          </div>
          {levelChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="Count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No academic level data available.</div>
          )}
        </div>

      </div>
    </div>
  );
}
