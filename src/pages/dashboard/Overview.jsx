import { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { Users, GraduationCap, Heart, CheckCircle2, ShieldAlert } from "lucide-react";

const COLORS = ["#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("hgbc_admin_token");
        const res = await fetch("http://localhost:5000/api/stats", {
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
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
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
  // Wait, let's see how baptized is grouped. The db.js groups baptized separately?
  // Let's check db.js: "const studentCounts = {}; ... const maritalCounts = {};"
  // Oh, wait, in db.js we had a typo for baptized count grouping?
  // Let's look at db.js:
  // "const maritalCounts = {}; members.forEach(m => { ... }); ... const faculty = ... const discipleship = ..."
  // Ah! In db.js we didn't explicitly group baptized, but wait, the frontend doesn't strictly need it, we can calculate it dynamically from the stats or display the other available metrics (e.g. Total Married or Total Single)!
  // Yes! The stats returned:
  // totalMembers, gender, ageRange, lautechStudent, maritalStatus, faculty, discipleship, trend.
  // So we can display:
  // 1. Total Members: total
  // 2. LAUTECH Students: lautechYes
  // 3. Born Again: bornAgainYes
  // 4. Single Members: (stats.maritalStatus.find(m => m.marital_status === "Single") || { count: 0 }).count

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
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">Community membership analytics and metrics overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Members */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Members</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{total}</h3>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* LAUTECH Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">LAUTECH Students</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{lautechYes}</h3>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Born Again */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Born Again</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{bornAgainYes}</h3>
          </div>
          <div className="p-4 bg-pink-50 text-pink-600 rounded-2xl">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Single Members */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Single Members</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{singleCount}</h3>
          </div>
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Growth Trend LineChart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Registration Growth Trend</h3>
          {trendChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="Month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }} />
                  <Line type="monotone" dataKey="Registrations" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No trend data available.</div>
          )}
        </div>

        {/* Age Range BarChart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Age Range Distribution</h3>
          {ageChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="Count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No age data available.</div>
          )}
        </div>

        {/* Discipleship Classes completed BarChart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Discipleship Completion Stats</h3>
          {discipleshipChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={discipleshipChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={120} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="Completes" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No discipleship completions recorded.</div>
          )}
        </div>

        {/* Gender Breakdown PieChart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Gender Distribution</h3>
          {genderChartData.length > 0 ? (
            <div className="h-72 flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="w-full md:w-1/2 h-56">
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {genderChartData.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-sm font-semibold text-slate-700">{g.name}:</span>
                    <span className="text-sm text-slate-500 font-bold">{g.value} members</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No gender data available.</div>
          )}
        </div>

        {/* Academic Level Distribution BarChart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Academic Level Distribution</h3>
          {levelChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
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
