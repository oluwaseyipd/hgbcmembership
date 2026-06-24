import { useState, useEffect } from "react";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Download, Eye, Edit2, Trash2, X, AlertTriangle } from "lucide-react";

const ageRanges = ["Birth to 10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-90", "91 and Above"];
const maritalOptions = ["Single", "Married", "Divorced"];
const faculties = [
  "Faculty of Renewable Natural Resources",
  "Faculty of Agricultural Sciences",
  "Faculty of Basic Medical Sciences",
  "Faculty of Basic Clinical Sciences",
  "Faculty of Clinical Sciences",
  "Faculty of Environmental Sciences",
  "Faculty of Engineering and Technology",
  "Faculty of Pure and Applied Sciences",
  "Faculty of Food and Consumer Sciences",
  "Faculty of Management Sciences",
  "Faculty of Nursing Sciences",
  "Faculty of Computing and Informatics"
];
const levels = ["Pre-Degree", "JUBEB", "100", "200", "300", "400", "500", "600", "Masters", "PhD"];
const discipleshipOptions = [
  "Six Basic Lessons",
  "Follow The Master",
  "Serve The Master",
  "Master Life",
  "In God's Presence",
  "Experiencing God",
  "Mind of Christ",
  "Living on Purpose"
];

export default function Members() {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ totalItems: 0, currentPage: 1, totalPages: 1, limit: 10 });
  
  // Search and filters state
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [bornAgain, setBornAgain] = useState("");
  const [lautechStudent, setLautechStudent] = useState("");
  const [faculty, setFaculty] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  
  // Sorting state
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  // Modals state
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteMember, setDeleteMember] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Feedback state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchMembers = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("hgbc_admin_token");
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        gender,
        ageRange,
        bornAgain,
        lautechStudent,
        faculty,
        maritalStatus,
        sortBy,
        order
      });

      const res = await fetch(`http://localhost:5000/api/members?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to fetch members");

      setMembers(result.members);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(1);
  }, [search, gender, ageRange, bornAgain, lautechStudent, faculty, maritalStatus, sortBy, order]);

  // Handle pagination clicks
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMembers(page);
    }
  };

  // Toggle sorting
  const handleSort = (col) => {
    if (sortBy === col) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setOrder("asc");
    }
  };

  // CSV Export Trigger
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("hgbc_admin_token");
      const response = await fetch("http://localhost:5000/api/members/export", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hgbc_members_list.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError("Failed to download CSV: " + err.message);
    }
  };

  // Save updated member profile
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const token = localStorage.getItem("hgbc_admin_token");
      const res = await fetch(`http://localhost:5000/api/members/${editMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editMember)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed");
      
      setSuccessMsg("Member profile updated successfully!");
      setEditModalOpen(false);
      fetchMembers(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete member confirmation
  const handleConfirmDelete = async () => {
    setError("");
    setSuccessMsg("");
    try {
      const token = localStorage.getItem("hgbc_admin_token");
      const res = await fetch(`http://localhost:5000/api/members/${deleteMember.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Delete failed");
      
      setSuccessMsg("Member profile deleted successfully!");
      setDeleteModalOpen(false);
      fetchMembers(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 text-gray-700">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Members Database
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage, search, filter, and edit member information profiles</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg shadow-blue-500/10 cursor-pointer text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Database (CSV)</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200/50 text-green-700 p-4 rounded-xl text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200/50 text-red-700 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Search & Filters Section */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
        {/* Search & Main trigger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search members by name, email, or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 text-gray-800 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <select
              value={lautechStudent}
              onChange={(e) => {
                setLautechStudent(e.target.value);
                setFaculty(""); // reset faculty if non-student
              }}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            >
              <option value="">All Membership Types</option>
              <option value="Yes">LAUTECH Students</option>
              <option value="No">Non-LAUTECH Members</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Gender */}
          <div>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Gender (All)</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          {/* Age range */}
          <div>
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Age-Range (All)</option>
              {ageRanges.map(ar => (
                <option key={ar} value={ar}>{ar}</option>
              ))}
            </select>
          </div>

          {/* Born Again */}
          <div>
            <select
              value={bornAgain}
              onChange={(e) => setBornAgain(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Born Again (All)</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Maybe">Maybe</option>
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <select
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Marital Status (All)</option>
              {maritalOptions.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Faculty in LAUTECH */}
          <div>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              disabled={lautechStudent === "No"}
              className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-40"
            >
              <option value="">Faculty (All)</option>
              {faculties.map(f => (
                <option key={f} value={f}>{f.replace("Faculty of ", "")}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : members.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Gender</th>
                  <th className="py-4 px-6">Born Again</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("submitted_at")}>
                    <div className="flex items-center gap-1.5">
                      <span>Submission Date</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{member.name}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">{member.phone}</td>
                    <td className="py-4 px-6 text-slate-600">{member.email || "-"}</td>
                    <td className="py-4 px-6">{member.gender || "-"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        member.born_again === "Yes" 
                          ? "bg-green-50 text-green-700" 
                          : member.born_again === "Maybe" 
                          ? "bg-amber-50 text-amber-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {member.born_again || "No"}
                      </span>
                    </td>
                    <td className="py-4 px-6">{member.lautech_student}</td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(member.submitted_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => { setSelectedMember(member); setViewModalOpen(true); }}
                        className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => { setEditMember({ ...member }); setEditModalOpen(true); }}
                        className="p-1.5 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => { setDeleteMember(member); setDeleteModalOpen(true); }}
                        className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-sm">
            No matching members found in database.
          </div>
        )}

        {/* Pagination controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {members.length} of {pagination.totalItems} members
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => handlePageChange(pg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pagination.currentPage === pg
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PROFILE VIEW MODAL (renders all 26 fields in detailed grid) */}
      {viewModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90svh] flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-lg">Member Detailed Profile</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">ID: {selectedMember.id}</span>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-700">
              {/* Personal Section */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 mb-3 border-b border-blue-100 pb-1.5">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                  <div><span className="text-xs text-slate-400 font-semibold block">Full Name</span><span className="text-sm font-bold text-slate-800">{selectedMember.name}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Phone Number</span><span className="text-sm font-medium font-mono">{selectedMember.phone}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Whatsapp Number</span><span className="text-sm font-medium font-mono">{selectedMember.whatsapp || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Email Address</span><span className="text-sm font-medium">{selectedMember.email || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Date of Birth</span><span className="text-sm font-medium">{selectedMember.dob || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Gender</span><span className="text-sm font-medium">{selectedMember.gender || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Age Range</span><span className="text-sm font-medium">{selectedMember.age_range || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Marital Status</span><span className="text-sm font-medium">{selectedMember.marital_status || "None"}</span></div>
                  <div className="md:col-span-3"><span className="text-xs text-slate-400 font-semibold block">Home Address</span><span className="text-sm font-medium">{selectedMember.home_address || "None"}</span></div>
                </div>
              </div>

              {/* Spiritual Details */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-pink-600 mb-3 border-b border-pink-100 pb-1.5">Spiritual & Church Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                  <div><span className="text-xs text-slate-400 font-semibold block">Born Again</span><span className="text-sm font-medium">{selectedMember.born_again || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Baptized by Immersion</span><span className="text-sm font-medium">{selectedMember.baptized || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Baptist from Home</span><span className="text-sm font-medium">{selectedMember.baptist_from_home || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Home Church</span><span className="text-sm font-medium">{selectedMember.home_church || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Joined HGBC Date</span><span className="text-sm font-medium">{selectedMember.joined_hgbc || "None"}</span></div>
                  <div className="md:col-span-3"><span className="text-xs text-slate-400 font-semibold block">Completed Discipleship</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {selectedMember.discipleship_done && selectedMember.discipleship_done.length > 0 ? (
                        selectedMember.discipleship_done.map(d => (
                          <span key={d} className="text-xs font-semibold px-2 py-1 bg-green-50 border border-green-150 text-green-700 rounded-lg">{d}</span>
                        ))
                      ) : <span className="text-sm font-medium text-slate-400">None recorded</span>}
                    </div>
                  </div>
                  {selectedMember.salvation_xp && (
                    <div className="md:col-span-3"><span className="text-xs text-slate-400 font-semibold block">Salvation Experience</span><p className="text-sm text-slate-600 leading-relaxed mt-1">{selectedMember.salvation_xp}</p></div>
                  )}
                </div>
              </div>

              {/* Parent/Guardian Details */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-orange-600 mb-3 border-b border-orange-100 pb-1.5">Parent / Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                  <div><span className="text-xs text-slate-400 font-semibold block">Guardian Name</span><span className="text-sm font-bold text-slate-800">{selectedMember.guardian_name || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Guardian Phone</span><span className="text-sm font-medium font-mono">{selectedMember.guardian_phone || "None"}</span></div>
                  <div><span className="text-xs text-slate-400 font-semibold block">Relationship</span><span className="text-sm font-medium">{selectedMember.guardian_rel || "None"}</span></div>
                  <div className="md:col-span-3"><span className="text-xs text-slate-400 font-semibold block">Guardian Location</span><span className="text-sm font-medium">{selectedMember.guardian_loc || "None"}</span></div>
                </div>
              </div>

              {/* Academic Details */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-purple-600 mb-3 border-b border-purple-100 pb-1.5">LAUTECH Academic Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                  <div><span className="text-xs text-slate-400 font-semibold block">LAUTECH Student</span><span className="text-sm font-bold">{selectedMember.lautech_student}</span></div>
                  {selectedMember.lautech_student === "Yes" && (
                    <>
                      <div><span className="text-xs text-slate-400 font-semibold block">Current Level</span><span className="text-sm font-medium">{selectedMember.current_level}</span></div>
                      <div><span className="text-xs text-slate-400 font-semibold block">Faculty</span><span className="text-sm font-medium">{selectedMember.lautech_faculty}</span></div>
                      <div><span className="text-xs text-slate-400 font-semibold block">Department</span><span className="text-sm font-medium">{selectedMember.lautech_dept}</span></div>
                      <div className="md:col-span-2"><span className="text-xs text-slate-400 font-semibold block">Ogbomoso Hostel Address</span><span className="text-sm font-medium">{selectedMember.hostel_address || "None"}</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Comments details */}
              {selectedMember.comments && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-1.5">Additional Comments</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedMember.comments}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setEditMember({ ...selectedMember });
                  setViewModalOpen(false);
                  setEditModalOpen(true);
                }}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && editMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90svh] flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">Edit Member Profile</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 text-gray-700">
                {/* Personal Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 mb-1 border-b border-blue-100 pb-1.5">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editMember.name}
                        onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={editMember.phone}
                        onChange={(e) => setEditMember({ ...editMember, phone: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Whatsapp Number</label>
                      <input
                        type="tel"
                        value={editMember.whatsapp}
                        onChange={(e) => setEditMember({ ...editMember, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editMember.email || ""}
                        onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editMember.dob}
                        onChange={(e) => setEditMember({ ...editMember, dob: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Gender</label>
                      <select
                        value={editMember.gender}
                        onChange={(e) => setEditMember({ ...editMember, gender: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Age Range</label>
                      <select
                        value={editMember.age_range}
                        onChange={(e) => setEditMember({ ...editMember, age_range: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        {ageRanges.map(ar => (
                          <option key={ar} value={ar}>{ar}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Marital Status</label>
                      <select
                        value={editMember.marital_status}
                        onChange={(e) => setEditMember({ ...editMember, marital_status: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        {maritalOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Home Address</label>
                      <textarea
                        value={editMember.home_address}
                        onChange={(e) => setEditMember({ ...editMember, home_address: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Spiritual details */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-pink-600 mb-1 border-b border-pink-100 pb-1.5">Spiritual & Church Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Born Again</label>
                      <select
                        value={editMember.born_again}
                        onChange={(e) => setEditMember({ ...editMember, born_again: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Maybe">Maybe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Baptized by Immersion</label>
                      <select
                        value={editMember.baptized}
                        onChange={(e) => setEditMember({ ...editMember, baptized: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Baptist from Home</label>
                      <select
                        value={editMember.baptist_from_home}
                        onChange={(e) => setEditMember({ ...editMember, baptist_from_home: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Home Church Name</label>
                      <input
                        type="text"
                        value={editMember.home_church}
                        onChange={(e) => setEditMember({ ...editMember, home_church: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Joined HGBC Date</label>
                      <input
                        type="date"
                        value={editMember.joined_hgbc}
                        onChange={(e) => setEditMember({ ...editMember, joined_hgbc: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Salvation Experience</label>
                      <textarea
                        value={editMember.salvation_xp}
                        onChange={(e) => setEditMember({ ...editMember, salvation_xp: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      ></textarea>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Discipleship Completed</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {discipleshipOptions.map(option => {
                          const isChecked = editMember.discipleship_done.includes(option);
                          return (
                            <label key={option} className="flex items-center gap-2 p-1 text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const updated = isChecked
                                    ? editMember.discipleship_done.filter(d => d !== option)
                                    : [...editMember.discipleship_done, option];
                                  setEditMember({ ...editMember, discipleship_done: updated });
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-4 h-4 cursor-pointer"
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-orange-600 mb-1 border-b border-orange-100 pb-1.5">Parent / Guardian Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Guardian Name</label>
                      <input
                        type="text"
                        value={editMember.guardian_name}
                        onChange={(e) => setEditMember({ ...editMember, guardian_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Guardian Phone</label>
                      <input
                        type="tel"
                        value={editMember.guardian_phone}
                        onChange={(e) => setEditMember({ ...editMember, guardian_phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={editMember.guardian_rel}
                        onChange={(e) => setEditMember({ ...editMember, guardian_rel: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Guardian Location</label>
                      <input
                        type="text"
                        value={editMember.guardian_loc}
                        onChange={(e) => setEditMember({ ...editMember, guardian_loc: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic details */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-600 mb-1 border-b border-purple-100 pb-1.5">LAUTECH Academic Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">LAUTECH Student</label>
                      <select
                        value={editMember.lautech_student}
                        onChange={(e) => setEditMember({ ...editMember, lautech_student: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    {editMember.lautech_student === "Yes" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Current Level</label>
                          <select
                            value={editMember.current_level}
                            onChange={(e) => setEditMember({ ...editMember, current_level: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                          >
                            {levels.map(l => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Faculty</label>
                          <select
                            value={editMember.lautech_faculty}
                            onChange={(e) => setEditMember({ ...editMember, lautech_faculty: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                          >
                            <option value="">Select Faculty</option>
                            {faculties.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                          <input
                            type="text"
                            value={editMember.lautech_dept}
                            onChange={(e) => setEditMember({ ...editMember, lautech_dept: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Ogbomoso Hostel Address</label>
                          <input
                            type="text"
                            value={editMember.hostel_address}
                            onChange={(e) => setEditMember({ ...editMember, hostel_address: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional comments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Other Comments</label>
                  <textarea
                    value={editMember.comments}
                    onChange={(e) => setEditMember({ ...editMember, comments: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && deleteMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 text-center text-gray-700">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-150">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Confirm Delete</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Are you sure you want to delete the member profile for <strong className="text-slate-800">{deleteMember.name}</strong>? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-center gap-3 border-t border-slate-100">
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                Delete Profile
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
