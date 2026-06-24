import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import logo from "../assets/images/logo.png";

export default function Success() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 py-12 relative font-sans">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="w-full max-w-lg text-center relative">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
          {/* Logo */}
          <img src={logo} alt="HGBC Logo" className="w-16 h-16 mx-auto mb-6 drop-shadow-md" />

          {/* Animated Success Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-10 h-10" />
          </motion.div>

          {/* Text Details */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-slate-800"
          >
            Registration Completed!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-600 mt-4 leading-relaxed"
          >
            Thank you for filling out the HGBC Member's Information form. Your details have been successfully recorded in the community database.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 border-t border-slate-100 pt-8"
          >
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/10"
            >
              Submit Another Form
            </Link>
            <a
              href="https://hgbcinfluencers.org"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-all text-center"
            >
              Visit HGBC Website
            </a>
          </motion.div>
        </div>

        <p className="text-slate-400 text-xs mt-6">
          © {new Date().getFullYear()} Higher Ground Baptist Church. All rights reserved.
        </p>
      </div>
    </div>
  );
}
