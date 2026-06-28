import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Heart, Shield, GraduationCap, ChevronLeft, ChevronRight, Check } from "lucide-react";
import logo from "../assets/images/logo.png";
import { API_URL } from "../constants/api";

// Step titles and icons
const steps = [
  { title: "Personal Info", icon: User },
  { title: "Spiritual Details", icon: Heart },
  { title: "Parent/Guardian", icon: Shield },
  { title: "Academic & More", icon: GraduationCap }
];

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

const levels = ["Not Applicable", "Pre-Degree", "JUBEB", "100", "200", "300", "400", "500", "600", "Masters", "PhD"];
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

export default function MembershipForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states mapping directly to backend properties
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dob: "",
    whatsapp: "",
    email: "",
    gender: "",
    joined_hgbc: "",
    age_range: "",
    born_again: "",
    baptized: "",
    baptist_from_home: "",
    home_church: "",
    salvation_xp: "",
    home_address: "",
    marital_status: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_rel: "",
    guardian_loc: "",
    lautech_student: "No",
    current_level: "Not Applicable",
    hostel_address: "",
    lautech_faculty: "",
    discipleship_done: [],
    lautech_dept: "",
    comments: ""
  });

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (option) => {
    setFormData((prev) => {
      const currentDone = prev.discipleship_done;
      const isChecked = currentDone.includes(option);
      return {
        ...prev,
        discipleship_done: isChecked
          ? currentDone.filter((d) => d !== option)
          : [...currentDone, option]
      };
    });
  };

  // Step 1 validation
  const validateStep = () => {
    setError("");
    if (currentStep === 0) {
      if (!formData.name.trim()) return "Name (Surname First) is required.";
      if (!formData.phone.trim()) return "Phone number is required.";
      if (!formData.gender) return "Please select your gender.";
      if (!formData.age_range) return "Please select your age range.";
      if (!formData.marital_status) return "Please select your marital status.";
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        return "Please enter a valid email address.";
      }
    } else if (currentStep === 1) {
      if (!formData.born_again) return "Please specify if you are Born Again.";
      if (formData.born_again === "Yes" && !formData.salvation_xp.trim()) {
        return "Please briefly share your salvation experience.";
      }
      if (!formData.baptized) return "Please select if you are Baptized by Immersion.";
      if (!formData.baptist_from_home) return "Please select if you are a Baptist from home.";
    } else if (currentStep === 2) {
      // Guardian details are optional, but if parent name is filled, phone number is good to check
      if (formData.guardian_phone && !/^\+?[0-9\s-]{7,15}$/.test(formData.guardian_phone)) {
        return "Please enter a valid guardian phone number.";
      }
    } else if (currentStep === 3) {
      if (formData.lautech_student === "Yes") {
        if (formData.current_level === "Not Applicable") {
          return "Please select your current academic level.";
        }
        if (!formData.lautech_faculty) {
          return "Please select your Faculty in LAUTECH.";
        }
        if (!formData.lautech_dept.trim()) {
          return "Please enter your department name.";
        }
      }
    }
    return "";
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Something went wrong. Please try again.");
      }
      // Redirect to success page
      navigate("/success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ActiveIcon = steps[currentStep].icon;

  return (
    <div id="membership-form" className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4 py-12 relative font-sans">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="w-full max-w-3xl relative">

        {/* Stepper Progress bar */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20 shadow-sm">
          <div className="flex justify-between items-center relative px-2">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10 -translate-y-1/2 mx-8"></div>
            <div
              className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-orange-600 to-orange-500 -z-10 -translate-y-1/2 mx-8 transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 90}%` }}
            ></div>

            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;

              return (
                <div key={idx} className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                      ? "bg-orange-600 border-transparent text-white shadow-md shadow-orange-500/20"
                      : isActive
                        ? "bg-white border-orange-500 text-orange-500 scale-110 shadow-lg shadow-orange-500/10"
                        : "bg-white border-slate-300 text-slate-400"
                      }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs mt-2 font-semibold hidden md:block transition-all duration-300 ${isActive ? "text-orange-500 font-bold" : isCompleted ? "text-slate-700" : "text-slate-400"
                      }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{steps[currentStep].title}</h2>
              <p className="text-xs text-slate-500">Step {currentStep + 1} of 4</p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-700 border border-red-200/50 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          {/* Form Step Contents */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* STEP 1: PERSONAL INFORMATION */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Name (Surname First) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleTextChange}
                        placeholder="e.g. Alabi Emmanuel Tunde"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleTextChange}
                        placeholder="e.g. 08012345678"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Whatsapp Number</label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleTextChange}
                        placeholder="e.g. 08012345678"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleTextChange}
                        placeholder="e.g. emmanuel@example.com"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleTextChange}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleTextChange}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Age-Range <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="age_range"
                        value={formData.age_range}
                        onChange={handleTextChange}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Age-Range</option>
                        <option value="Birth to 10">Birth to 10</option>
                        <option value="11-20">11-20</option>
                        <option value="21-30">21-30</option>
                        <option value="31-40">31-40</option>
                        <option value="41-50">41-50</option>
                        <option value="51-60">51-60</option>
                        <option value="61-70">61-70</option>
                        <option value="71-80">71-80</option>
                        <option value="81-90">81-90</option>
                        <option value="91 and Above">91 and Above</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Marital Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="marital_status"
                        value={formData.marital_status}
                        onChange={handleTextChange}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Home (House) Address</label>
                      <textarea
                        name="home_address"
                        value={formData.home_address}
                        onChange={handleTextChange}
                        rows={2}
                        placeholder="Enter your house address..."
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* STEP 2: SPIRITUAL WALK & CHURCH DETAILS */}
                {currentStep === 1 && (
                  <div className="space-y-5 text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Are You Born Again? <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="born_again"
                          value={formData.born_again}
                          onChange={handleTextChange}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select Option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Maybe">Maybe</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Are You Baptized by Immersion? <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="baptized"
                          value={formData.baptized}
                          onChange={handleTextChange}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select Option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>

                    {formData.born_again === "Yes" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Briefly Share Your Salvation Experience <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="salvation_xp"
                          value={formData.salvation_xp}
                          onChange={handleTextChange}
                          rows={3}
                          placeholder="How did you accept Christ as your Lord and Savior?"
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        ></textarea>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Are You A Baptist From Home? <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="baptist_from_home"
                          value={formData.baptist_from_home}
                          onChange={handleTextChange}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select Option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Name of Home Church</label>
                        <input
                          type="text"
                          name="home_church"
                          value={formData.home_church}
                          onChange={handleTextChange}
                          placeholder="e.g. Ebenezer Baptist Church"
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">When Did You Join HGBC?</label>
                        <input
                          type="date"
                          name="joined_hgbc"
                          value={formData.joined_hgbc}
                          onChange={handleTextChange}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Which Discipleship Have You Completed?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {discipleshipOptions.map((option) => {
                          const isChecked = formData.discipleship_done.includes(option);
                          return (
                            <label
                              key={option}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked
                                ? "bg-orange-50 border-orange-200 text-orange-500 font-medium"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-orange-50"
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(option)}
                                className="hidden"
                              />
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isChecked ? "bg-orange-500 border-orange-500 text-white" : "border-slate-300 bg-white"
                                  }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5" />}
                              </div>
                              <span className="text-sm">{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: EMERGENCY / PARENT / GUARDIAN INFO */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Name of Parent or Guardian
                      </label>
                      <input
                        type="text"
                        name="guardian_name"
                        value={formData.guardian_name}
                        onChange={handleTextChange}
                        placeholder="Someone responsible for you"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number of Parent/Guardian
                      </label>
                      <input
                        type="tel"
                        name="guardian_phone"
                        value={formData.guardian_phone}
                        onChange={handleTextChange}
                        placeholder="Guardian's contact phone"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Relationship With The Person Above?
                      </label>
                      <select
                        name="guardian_rel"
                        value={formData.guardian_rel}
                        onChange={handleTextChange}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Relationship</option>
                        <option value="Biological Parent">Biological Parent</option>
                        <option value="Parent Figure">Parent Figure</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Location of Guardian</label>
                      <input
                        type="text"
                        name="guardian_loc"
                        value={formData.guardian_loc}
                        onChange={handleTextChange}
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: ACADEMIC & ADDITIONAL DETAILS */}
                {currentStep === 3 && (
                  <div className="space-y-5 text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Are You a LAUTECH Student?
                        </label>
                        <select
                          name="lautech_student"
                          value={formData.lautech_student}
                          onChange={handleTextChange}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>

                      {formData.lautech_student === "Yes" && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            What Is Your Current Level? <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="current_level"
                            value={formData.current_level}
                            onChange={handleTextChange}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          >
                            <option value="Not Applicable">Select Level</option>
                            {levels.filter(l => l !== "Not Applicable").map((l) => (
                              <option key={l} value={l}>
                                {l}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {formData.lautech_student === "Yes" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-hidden"
                      >
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Faculty in LAUTECH <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="lautech_faculty"
                            value={formData.lautech_faculty}
                            onChange={handleTextChange}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          >
                            <option value="">Select Faculty</option>
                            {faculties.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="lautech_dept"
                            value={formData.lautech_dept}
                            onChange={handleTextChange}
                            placeholder="e.g. Computer Science"
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Ogbomoso (Hostel) Address
                          </label>
                          <input
                            type="text"
                            name="hostel_address"
                            value={formData.hostel_address}
                            onChange={handleTextChange}
                            placeholder="e.g. Under-G, Ogbomoso"
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Other Comments</label>
                      <textarea
                        name="comments"
                        value={formData.comments}
                        onChange={handleTextChange}
                        rows={3}
                        placeholder="Any other comments or feedback..."
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      ></textarea>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Form actions navigation buttons */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0 || loading}
                className="flex items-center gap-2 px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:from-orange-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg shadow-orange-500/10 cursor-pointer disabled:opacity-80"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === steps.length - 1 ? "Submit Details" : "Continue"}</span>
                    {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
